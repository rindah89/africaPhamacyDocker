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

async function reconstructSales(start, end) {
  console.log(`Reconstructing actual sales from ${start.toISOString()} to ${end.toISOString()}`);

  // Fetch line items whose parent order is in range and not failed
  const items = await prisma.lineOrderItem.findMany({
    where: {
      lineOrder: {
        is: {
          createdAt: { gte: start, lt: end },
          status: { in: ['DELIVERED', 'PROCESSING'] },
        },
      },
    },
    include: {
      lineOrder: true,
    },
  });

  console.log(`Fetched ${items.length} line items in range.`);

  const uniqueOrderIds = new Set(items.map(i => i.orderId));

  const grandTotals = {
    totalRevenue: 0,
    totalQuantity: 0,
    numOrders: uniqueOrderIds.size,
    numItems: items.length,
  };

  const byDay = new Map(); // yyyy-mm-dd -> { revenue, qty, orders:Set }
  const byProduct = new Map(); // productId -> { name, qty, revenue }
  const byPaymentMethod = new Map(); // method -> { revenue, qty }

  for (const item of items) {
    const revenue = item.price * item.qty;
    grandTotals.totalRevenue += revenue;
    grandTotals.totalQuantity += item.qty;

    const dayKey = toYMD(item.lineOrder.createdAt);
    if (!byDay.has(dayKey)) {
      byDay.set(dayKey, { revenue: 0, qty: 0, orders: new Set() });
    }
    const dAgg = byDay.get(dayKey);
    dAgg.revenue += revenue;
    dAgg.qty += item.qty;
    dAgg.orders.add(item.orderId);

    if (!byProduct.has(item.productId)) {
      byProduct.set(item.productId, { name: item.name, qty: 0, revenue: 0 });
    }
    const pAgg = byProduct.get(item.productId);
    pAgg.qty += item.qty;
    pAgg.revenue += revenue;

    const method = item.lineOrder.paymentMethod || 'NONE';
    if (!byPaymentMethod.has(method)) {
      byPaymentMethod.set(method, { revenue: 0, qty: 0 });
    }
    const mAgg = byPaymentMethod.get(method);
    mAgg.revenue += revenue;
    mAgg.qty += item.qty;
  }

  // Output
  console.log('\n=== Grand Totals ===');
  console.log({
    totalRevenue: Math.round(grandTotals.totalRevenue * 100) / 100,
    totalQuantity: grandTotals.totalQuantity,
    numOrders: grandTotals.numOrders,
    numItems: grandTotals.numItems,
  });

  console.log('\n=== Daily Totals ===');
  const dailyRows = Array.from(byDay.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([day, agg]) => ({
      day,
      revenue: Math.round(agg.revenue * 100) / 100,
      quantity: agg.qty,
      numOrders: agg.orders.size,
    }));
  console.table(dailyRows);

  console.log('\n=== Payment Method Breakdown ===');
  const methodRows = Array.from(byPaymentMethod.entries())
    .map(([method, agg]) => ({
      paymentMethod: method,
      revenue: Math.round(agg.revenue * 100) / 100,
      quantity: agg.qty,
    }))
    .sort((a, b) => b.revenue - a.revenue);
  console.table(methodRows);

  console.log('\n=== Top Products (by revenue) ===');
  const productRows = Array.from(byProduct.entries())
    .map(([productId, agg]) => ({
      productId,
      productName: agg.name,
      revenue: Math.round(agg.revenue * 100) / 100,
      quantity: agg.qty,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 50);
  console.table(productRows);

  return { grandTotals, dailyRows, methodRows, productRows };
}

async function main() {
  const start = getEnvDate('START_DATE', '2024-08-05T00:00:00.000Z');
  const end = getEnvDate('END_DATE', '2024-08-14T00:00:00.000Z');

  try {
    await reconstructSales(start, end);
  } catch (err) {
    console.error('Failed to reconstruct sales:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  console.log('Starting reconstruction...');
  main().then(() => console.log('Done.'));
}



