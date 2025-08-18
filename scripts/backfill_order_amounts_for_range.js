const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function getEnvDate(name, fallback) {
  const raw = process.env[name] || fallback;
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`${name} is not a valid date: ${raw}`);
  }
  return d;
}

async function backfillOrderAmountsForRange(start, end) {
  console.log(`Backfilling order amounts for orders between ${start.toISOString()} and ${end.toISOString()}`);

  const orders = await prisma.lineOrder.findMany({
    where: {
      createdAt: { gte: start, lt: end },
      status: { in: ['DELIVERED', 'PROCESSING'] },
    },
    include: {
      lineOrderItems: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${orders.length} orders in range.`);

  let updated = 0;
  for (const order of orders) {
    const computedAmount = order.lineOrderItems.reduce((sum, it) => sum + it.price * it.qty, 0);
    const rounded = Math.round(computedAmount);

    const needUpdate = (order.orderAmount ?? 0) !== rounded || (order.amountPaid ?? 0) !== rounded;
    if (!needUpdate) continue;

    await prisma.lineOrder.update({
      where: { id: order.id },
      data: {
        orderAmount: rounded,
        amountPaid: rounded,
      },
    });
    updated += 1;
  }

  console.log(`Updated ${updated} orders with computed amounts.`);
}

async function main() {
  const start = getEnvDate('START_DATE', '2024-08-05T00:00:00.000Z');
  const end = getEnvDate('END_DATE', '2024-08-14T00:00:00.000Z');
  try {
    await backfillOrderAmountsForRange(start, end);
  } catch (e) {
    console.error('Backfill failed:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  console.log('Starting order amounts backfill (date-scoped)...');
  main().then(() => console.log('Done.'));
}



