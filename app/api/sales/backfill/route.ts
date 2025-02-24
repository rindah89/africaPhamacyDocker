import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

async function backfillSales() {
  try {
    console.log('Starting sales backfill process...');
    
    // Get all orders that don't have associated sales records
    const ordersWithoutSales = await prisma.lineOrder.findMany({
      where: {
        sales: {
          none: {}  // Orders with no sales records
        }
      },
      include: {
        lineOrderItems: true,
        sales: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${ordersWithoutSales.length} orders without sales records`);
    
    let totalProcessed = 0;
    let totalSuccess = 0;
    let totalFailed = 0;
    const CHUNK_SIZE = 5;

    // Process orders in chunks
    for (let i = 0; i < ordersWithoutSales.length; i += CHUNK_SIZE) {
      const orderChunk = ordersWithoutSales.slice(i, i + CHUNK_SIZE);

      for (const order of orderChunk) {
        try {
          console.log(`Processing order ${order.orderNumber}:`, {
            orderId: order.id,
            itemCount: order.lineOrderItems.length,
            items: order.lineOrderItems.map(item => ({
              id: item.id,
              productId: item.productId,
              name: item.name,
              price: item.price,
              qty: item.qty
            }))
          });

          // Create sales records for each line item
          for (const item of order.lineOrderItems) {
            try {
              await prisma.sale.create({
                data: {
                  orderId: order.id,
                  orderNumber: order.orderNumber,
                  productId: item.productId,
                  qty: item.qty,
                  salePrice: item.price,
                  total: item.price * item.qty,
                  productName: item.name,
                  productImage: item.productThumbnail || '',
                  customerName: order.customerName || 'Walk-in Customer',
                  customerEmail: order.customerEmail || '',
                  createdAt: order.createdAt,
                  updatedAt: order.createdAt
                }
              });
              console.log(`Successfully created sale record for item ${item.name} in order ${order.orderNumber}`);
            } catch (itemError) {
              console.error(`Failed to create sale record for item ${item.name} in order ${order.orderNumber}:`, {
                error: itemError,
                itemDetails: {
                  orderId: order.id,
                  orderNumber: order.orderNumber,
                  productId: item.productId,
                  name: item.name,
                  price: item.price,
                  qty: item.qty
                }
              });
              throw itemError; // Re-throw to be caught by the order-level catch
            }
          }

          totalSuccess++;
          console.log(`Successfully processed all items for order ${order.orderNumber}`);
        } catch (error) {
          totalFailed++;
          console.error(`Failed to process order ${order.orderNumber}:`, {
            error: error instanceof Error ? {
              message: error.message,
              stack: error.stack,
              name: error.name
            } : error,
            orderDetails: {
              id: order.id,
              orderNumber: order.orderNumber,
              itemCount: order.lineOrderItems.length
            }
          });
        }
        totalProcessed++;
      }

      // Add a small delay between chunks to prevent overload
      if (i + CHUNK_SIZE < ordersWithoutSales.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return {
      totalProcessed,
      totalSuccess,
      totalFailed,
      ordersWithoutSales: ordersWithoutSales.length
    };

  } catch (error) {
    console.error('Error during backfill process:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    });
    throw error;
  }
}

export async function POST() {
  try {
    const result = await backfillSales();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Backfill API error:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    });
    return NextResponse.json(
      { 
        error: 'Failed to backfill sales records',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 