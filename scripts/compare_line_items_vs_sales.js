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
  const start = getEnvDate('START_DATE', '2025-08-05T00:00:00.000Z');
  const end = getEnvDate('END_DATE', '2025-08-14T00:00:00.000Z');
  console.log(`Comparing LineOrderItems vs Sale between ${start.toISOString()} and ${end.toISOString()}`);

  try {
    // Pull line items (source of truth)
    const lineItems = await prisma.lineOrderItem.findMany({
      where: {
        lineOrder: {
          is: {
            createdAt: { gte: start, lt: end },
            status: { in: ['DELIVERED', 'PROCESSING'] },
          },
        },
      },
      include: { lineOrder: true },
    });

    // Pull sale rows recorded
    const sales = await prisma.sale.findMany({
      where: { createdAt: { gte: start, lt: end } },
      select: { createdAt: true, salePrice: true, qty: true },
    });

    // Aggregate totals
    let itemsTotal = 0, itemsQty = 0;
    const itemsDaily = new Map();
    for (const it of lineItems) {
      const r = it.price * it.qty;
      itemsTotal += r;
      itemsQty += it.qty;
      const day = toYMD(it.lineOrder.createdAt);
      itemsDaily.set(day, (itemsDaily.get(day) || 0) + r);
    }

    let salesTotal = 0, salesQty = 0;
    const salesDaily = new Map();
    for (const s of sales) {
      const r = s.salePrice * s.qty;
      salesTotal += r;
      salesQty += s.qty;
      const day = toYMD(s.createdAt);
      salesDaily.set(day, (salesDaily.get(day) || 0) + r);
    }

    const diff = Math.round((itemsTotal - salesTotal) * 100) / 100;
    console.log('\n=== Totals ===');
    console.table([
      { source: 'LineOrderItem', revenue: Math.round(itemsTotal), quantity: itemsQty },
      { source: 'Sale',          revenue: Math.round(salesTotal), quantity: salesQty },
      { source: 'DIFFERENCE',    revenue: Math.round(diff),      quantity: itemsQty - salesQty },
    ]);

    // Daily comparison
    const allDays = new Set([...itemsDaily.keys(), ...salesDaily.keys()]);
    const dailyRows = [...allDays].sort().map(day => ({
      day,
      lineItemsRevenue: Math.round((itemsDaily.get(day) || 0)),
      saleRevenue: Math.round((salesDaily.get(day) || 0)),
      revenueDiff: Math.round(((itemsDaily.get(day) || 0) - (salesDaily.get(day) || 0))),
    }));
    console.log('\n=== Daily Revenue Comparison ===');
    console.table(dailyRows);

    // Orders missing sales
    const ordersWithoutSales = await prisma.lineOrder.findMany({
      where: {
        createdAt: { gte: start, lt: end },
        status: { in: ['DELIVERED', 'PROCESSING'] },
        sales: { none: {} },
      },
      select: { id: true, orderNumber: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    console.log(`\nOrders without sales in window: ${ordersWithoutSales.length}`);
    console.table(ordersWithoutSales.map(o => ({ orderNumber: o.orderNumber, createdAt: o.createdAt })));
  } catch (e) {
    console.error('Comparison failed:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}



