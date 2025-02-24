const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function backfillOrderAmounts() {
  try {
    console.log('Starting order amounts backfill process...');
    
    // Get all orders with null amountPaid but have sales records
    const ordersToUpdate = await prisma.lineOrder.findMany({
      where: {
        amountPaid: null,
        sales: {
          some: {} // Orders that have sales records
        }
      },
      include: {
        sales: true,
        lineOrderItems: true
      }
    });

    console.log(`Found ${ordersToUpdate.length} orders to update`);
    
    let totalProcessed = 0;
    let totalSuccess = 0;
    let totalFailed = 0;
    const CHUNK_SIZE = 10; // Process 10 orders at a time

    // Process orders in chunks
    for (let i = 0; i < ordersToUpdate.length; i += CHUNK_SIZE) {
      const orderChunk = ordersToUpdate.slice(i, i + CHUNK_SIZE);
      console.log(`\nProcessing chunk ${i / CHUNK_SIZE + 1} of ${Math.ceil(ordersToUpdate.length / CHUNK_SIZE)}`);

      for (const order of orderChunk) {
        try {
          console.log(`\nProcessing order ${order.orderNumber}...`);

          // Calculate total amount from line items
          const orderAmount = order.lineOrderItems.reduce((sum, item) => {
            return sum + (item.price * item.qty);
          }, 0);

          // Update the order with calculated amounts
          await prisma.lineOrder.update({
            where: {
              id: order.id
            },
            data: {
              orderAmount: Math.round(orderAmount), // Convert to integer
              amountPaid: Math.round(orderAmount) // Assuming full payment for completed orders
            }
          });

          totalSuccess++;
          console.log(`Successfully updated order ${order.orderNumber} with amount: ${orderAmount}`);
        } catch (error) {
          totalFailed++;
          console.error(`Failed to update order ${order.orderNumber}:`, error);
        }
        totalProcessed++;
      }

      // Add a small delay between chunks to prevent overload
      if (i + CHUNK_SIZE < ordersToUpdate.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('\nBackfill Summary:');
    console.log(`Total Orders Processed: ${totalProcessed}`);
    console.log(`Successfully Updated: ${totalSuccess}`);
    console.log(`Failed to Update: ${totalFailed}`);

    // Verify the results
    const verificationCheck = await prisma.lineOrder.count({
      where: {
        amountPaid: null,
        sales: {
          some: {}
        }
      }
    });

    console.log(`\nVerification Check:`);
    console.log(`Orders still with null amounts: ${verificationCheck}`);

  } catch (error) {
    console.error('Error during backfill process:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the backfill
console.log('Starting backfill process...');
backfillOrderAmounts()
  .then(() => console.log('Backfill process completed'))
  .catch(error => console.error('Backfill process failed:', error)); 