import { PrismaClient } from '@prisma/client';

async function removeCounterModel() {
  const prisma = new PrismaClient();
  
  try {
    // First, try to delete all records in the Counter model
    const deleteResult = await prisma.$queryRaw`
      db.Counter.drop()
    `;
    
    console.log('Counter collection removed successfully');
    
    // Force Prisma to refresh its schema cache
    await prisma.$disconnect();
    await prisma.$connect();
    
  } catch (error) {
    console.error('Error removing Counter collection:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeCounterModel()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 