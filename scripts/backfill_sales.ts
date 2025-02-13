const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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
    const CHUNK_SIZE = 5; // Process 5 orders at a time

    // Process orders in chunks
    for (let i = 0; i < ordersWithoutSales.length; i += CHUNK_SIZE) {
      const orderChunk = ordersWithoutSales.slice(i, i + CHUNK_SIZE);
      console.log(`\nProcessing chunk ${i / CHUNK_SIZE + 1} of ${Math.ceil(ordersWithoutSales.length / CHUNK_SIZE)}`);

      for (const order of orderChunk) {
        try {
          console.log(`\nProcessing order ${order.orderNumber} (${order.lineOrderItems.length} items)...`);

          // Create sales records for each line item
          for (const item of order.lineOrderItems) {
            await prisma.sale.create({
              data: {
                orderId: order.id,
                productId: item.productId,
                qty: item.qty,
                salePrice: item.price,
                productName: item.name,
                productImage: item.productThumbnail || '',
                customerName: order.customerName || 'Walk-in Customer',
                customerEmail: order.customerEmail || '',
                createdAt: order.createdAt, // Use the order's creation date
                updatedAt: order.createdAt
              }
            });
            console.log(`Created sale record for ${item.name}`);
          }

          totalSuccess++;
          console.log(`Successfully processed order ${order.orderNumber}`);
        } catch (error) {
          totalFailed++;
          console.error(`Failed to process order ${order.orderNumber}:`, error);
        }
        totalProcessed++;
      }

      // Add a small delay between chunks to prevent overload
      if (i + CHUNK_SIZE < ordersWithoutSales.length) {
        console.log('Waiting 1 second before next chunk...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('\nBackfill Summary:');
    console.log(`Total Orders Processed: ${totalProcessed}`);
    console.log(`Successfully Processed: ${totalSuccess}`);
    console.log(`Failed to Process: ${totalFailed}`);

    // Verify the results
    const verificationCheck = await prisma.lineOrder.findMany({
      where: {
        sales: {
          none: {}
        }
      },
      select: {
        id: true
      }
    });

    console.log(`\nVerification Check:`);
    console.log(`Orders still without sales records: ${verificationCheck.length}`);

  } catch (error) {
    console.error('Error during backfill process:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the backfill
console.log('Starting backfill process...');
backfillSales()
  .then(() => console.log('Backfill process completed'))
  .catch(error => console.error('Backfill process failed:', error)); 