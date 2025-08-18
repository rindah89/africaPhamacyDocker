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

async function backfillSalesForRange(start, end) {
  console.log(`Backfilling missing sales for orders between ${start.toISOString()} and ${end.toISOString()}`);

  const orders = await prisma.lineOrder.findMany({
    where: {
      createdAt: { gte: start, lt: end },
      status: { in: ['DELIVERED', 'PROCESSING'] },
      sales: { none: {} },
    },
    include: {
      lineOrderItems: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${orders.length} orders without sales in range.`);

  let created = 0;
  for (const order of orders) {
    console.log(`Creating ${order.lineOrderItems.length} sale(s) for order ${order.orderNumber} (${order.id})`);
    for (const item of order.lineOrderItems) {
      await prisma.sale.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          qty: item.qty,
          salePrice: item.price,
          total: item.price * item.qty,
          productName: item.name,
          productImage: item.productThumbnail || '',
          customerName: order.customerName || 'Walk-in Customer',
          customerEmail: order.customerEmail || '',
          orderNumber: order.orderNumber || null,
          createdAt: order.createdAt,
          updatedAt: order.createdAt,
          paymentMethod: order.paymentMethod || 'NONE',
        },
      });
      created += 1;
    }
  }

  console.log(`Created ${created} sale rows for ${orders.length} orders.`);
}

async function main() {
  const start = getEnvDate('START_DATE', '2024-08-05T00:00:00.000Z');
  const end = getEnvDate('END_DATE', '2024-08-14T00:00:00.000Z');
  try {
    await backfillSalesForRange(start, end);
  } catch (e) {
    console.error('Backfill failed:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  console.log('Starting backfill (date-scoped)...');
  main().then(() => console.log('Done.'));
}



