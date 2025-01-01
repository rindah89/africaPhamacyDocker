import prisma from "@/lib/db";

async function migrateBatchData() {
  try {
    // Get all products with batch data
    const products = await prisma.product.findMany({
      select: {
        id: true,
        batchNumber: true,
        expiryDate: true,
        productCost: true,
        stockQty: true,
      },
    });

    console.log(`Found ${products.length} products to migrate`);

    // Create batches for each product
    for (const product of products) {
      if (product.batchNumber && product.expiryDate) {
        await prisma.productBatch.create({
          data: {
            batchNumber: product.batchNumber,
            quantity: product.stockQty,
            expiryDate: product.expiryDate,
            costPerUnit: product.productCost,
            status: true,
            productId: product.id,
          },
        });
        console.log(`Created batch for product ${product.id}`);
      }
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateBatchData(); 