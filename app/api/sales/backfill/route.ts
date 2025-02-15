import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

async function backfillSales() {
  try {
    console.log('Starting sales backfill process...');
    
    // Get all orders that don't have associated sales records
    const ordersWithoutSales = await prismaClient.lineOrder.findMany({
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
    const CHUNK_SIZE = 5; // Process 5 orders at a time

    // Process orders in chunks
    for (let i = 0; i < ordersWithoutSales.length; i += CHUNK_SIZE) {
      const orderChunk = ordersWithoutSales.slice(i, i + CHUNK_SIZE);

      for (const order of orderChunk) {
        try {
          // Create sales records for each line item
          for (const item of order.lineOrderItems) {
            await prismaClient.sale.create({
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
          }

          totalSuccess++;
        } catch (error) {
          totalFailed++;
          console.error(`Failed to process order ${order.orderNumber}:`, error);
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
    console.error('Error during backfill process:', error);
    throw error;
  } finally {
    await prismaClient.$disconnect();
  }
}

export async function POST() {
  try {
    const result = await backfillSales();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to backfill sales records' },
      { status: 500 }
    );
  }
} 