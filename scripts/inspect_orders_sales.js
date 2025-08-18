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

function toYMD(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function main() {
  const start = getEnvDate('START_DATE', '2024-07-01T00:00:00.000Z');
  const end = getEnvDate('END_DATE', '2024-09-30T23:59:59.999Z');
  console.log(`Inspecting orders and sales between ${start.toISOString()} and ${end.toISOString()}`);

  try {
    const [firstOrder, lastOrder, orderCount, saleCount] = await Promise.all([
      prisma.lineOrder.findFirst({ orderBy: { createdAt: 'asc' }, select: { id: true, orderNumber: true, createdAt: true } }),
      prisma.lineOrder.findFirst({ orderBy: { createdAt: 'desc' }, select: { id: true, orderNumber: true, createdAt: true } }),
      prisma.lineOrder.count({ where: { createdAt: { gte: start, lte: end } } }),
      prisma.sale.count({ where: { createdAt: { gte: start, lte: end } } }),
    ]);

    console.log('\n=== Overall Order Range ===');
    console.log({ firstOrder, lastOrder });
    console.log('\n=== Counts in Window ===');
    console.log({ ordersInWindow: orderCount, salesInWindow: saleCount });

    // Pull lightweight date series for orders and sales within window
    const [orders, sales] = await Promise.all([
      prisma.lineOrder.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { id: true, createdAt: true, status: true },
        orderBy: { createdAt: 'asc' },
        take: 5000,
      }),
      prisma.sale.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { id: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
        take: 20000,
      }),
    ]);

    const byDayOrders = new Map();
    const byDaySales = new Map();
    const byStatus = new Map();
    for (const o of orders) {
      const day = toYMD(o.createdAt);
      byDayOrders.set(day, (byDayOrders.get(day) || 0) + 1);
      byStatus.set(o.status, (byStatus.get(o.status) || 0) + 1);
    }
    for (const s of sales) {
      const day = toYMD(s.createdAt);
      byDaySales.set(day, (byDaySales.get(day) || 0) + 1);
    }

    console.log('\n=== Orders per day ===');
    console.table(Array.from(byDayOrders.entries()).map(([day, count]) => ({ day, orders: count }))); 

    console.log('\n=== Sales per day ===');
    console.table(Array.from(byDaySales.entries()).map(([day, count]) => ({ day, sales: count })));

    console.log('\n=== Orders by status in window ===');
    console.table(Array.from(byStatus.entries()).map(([status, count]) => ({ status, count })));

    // Quick sanity check: any line items in window
    const itemsCount = await prisma.lineOrderItem.count({
      where: { lineOrder: { is: { createdAt: { gte: start, lte: end } } } },
    });
    console.log(`\nLineOrderItem count in window: ${itemsCount}`);
  } catch (e) {
    console.error('Inspection failed:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}



