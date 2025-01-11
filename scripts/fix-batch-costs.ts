import prisma from "@/lib/db";

async function fixBatchCosts() {
  try {
    // Get all batches with their associated products
    const batches = await prisma.productBatch.findMany({
      include: {
        product: {
          select: {
            productCost: true,
            productPrice: true
          }
        }
      }
    });

    console.log(`Found ${batches.length} batches to check`);

    // Keep track of batches that need fixing
    const batchesToFix = batches.filter(batch => 
      Math.abs(batch.costPerUnit - batch.product.productCost) < 0.01 || // Fix batches with cost price
      batch.costPerUnit !== batch.product.productPrice // Fix any batches not matching selling price
    );

    console.log(`Found ${batchesToFix.length} batches with incorrect costs`);

    // Update each batch with the correct cost
    for (const batch of batchesToFix) {
      await prisma.productBatch.update({
        where: { id: batch.id },
        data: {
          costPerUnit: batch.product.productPrice
        }
      });
      console.log(`Fixed batch ${batch.batchNumber} cost from ${batch.costPerUnit} to ${batch.product.productPrice}`);
    }

    console.log('Cost correction completed successfully');
  } catch (error) {
    console.error('Cost correction failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixBatchCosts(); 