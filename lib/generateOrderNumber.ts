import prisma from "./db";

export async function generateOrderNumber(): Promise<string> {
  // Get or create the order counter
  const counter = await prisma.counter.upsert({
    where: { name: 'orderNumber' },
    update: { value: { increment: 1 } },
    create: { name: 'orderNumber', value: 1 }
  });

  // Format the number with leading zeros (6 digits)
  return String(counter.value).padStart(6, '0');
}
