import prisma from "./db";

export async function generateOrderNumber(): Promise<string> {
  // Get or create the order counter
  const counter = await prisma.counter.upsert({
    where: { name: 'orderNumber' },
    update: { value: { increment: 1 } },
    create: { 
      name: 'orderNumber', 
      value: 1 
    }
  });

  // Format the order number with leading zeros (e.g., ORD-000001)
  const formattedNumber = `ORD-${counter.value.toString().padStart(6, '0')}`;
  
  return formattedNumber;
}
