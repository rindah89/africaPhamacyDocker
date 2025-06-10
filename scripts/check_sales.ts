import { PrismaClient } from '@prisma/client';
import { subDays, subMonths, format, eachDayOfInterval } from 'date-fns';

const prisma = new PrismaClient();

interface Sale {
  id: string;
  createdAt: Date;
  productName: string;
  qty: number;
  salePrice: number;
  customerName: string;
  orderId: string;
  lineOrder: any;
}

interface LineOrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

interface LineOrder {
  id: string;
  createdAt: Date;
  orderNumber: string;
  customerName: string;
  orderAmount: number;
  lineOrderItems: LineOrderItem[];
  sales: Sale[];
}

async function main() {
  // 1. Check for sales with missing orderNumber
  const missingOrderNumberSales = await prisma.sale.findMany({
    where: {
      orderNumber: null,
    },
    select: {
      id: true,
      createdAt: true,
      productId: true,
      orderNumber: true,
    },
  });
  console.log(`Sales with missing orderNumber: ${missingOrderNumberSales.length}`);
  if (missingOrderNumberSales.length > 0) {
    console.table(missingOrderNumberSales.slice(0, 10));
  }

  // 2. Sales count for the last 7 days
  const now = new Date();
  const sevenDaysAgo = subDays(now, 6);
  const days = eachDayOfInterval({ start: sevenDaysAgo, end: now });
  const salesByDay: Record<string, number> = {};
  for (const day of days) {
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);
    const count = await prisma.sale.count({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });
    salesByDay[format(day, 'yyyy-MM-dd')] = count;
  }
  console.log('Sales count for the last 7 days:');
  console.table(salesByDay);

  // 3. Sales count for the last 6 months (by month)
  const salesByMonth: Record<string, number> = {};
  for (let i = 0; i < 6; i++) {
    const monthDate = subMonths(now, i);
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);
    const count = await prisma.sale.count({
      where: {
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });
    salesByMonth[format(monthDate, 'yyyy-MM')] = count;
  }
  console.log('Sales count for the last 6 months:');
  console.table(salesByMonth);

  // 4. Check for sales with broken product/category relationships (last 7 days)
  console.log('\nChecking for sales with broken product/category relationships (last 7 days)...');
  const recentSales = await prisma.sale.findMany({
    where: {
      createdAt: {
        gte: sevenDaysAgo,
        lte: now,
      },
    },
    select: {
      id: true,
      createdAt: true,
      productId: true,
      orderNumber: true,
    },
  });

  let brokenLinks: any[] = [];
  for (const sale of recentSales) {
    const product = await prisma.product.findUnique({ where: { id: sale.productId } });
    if (!product) {
      brokenLinks.push({ saleId: sale.id, issue: 'Missing Product', productId: sale.productId });
      continue;
    }
    const subCategory = await prisma.subCategory.findUnique({ where: { id: product.subCategoryId } });
    if (!subCategory) {
      brokenLinks.push({ saleId: sale.id, issue: 'Missing SubCategory', productId: sale.productId, subCategoryId: product.subCategoryId });
      continue;
    }
    const category = await prisma.category.findUnique({ where: { id: subCategory.categoryId } });
    if (!category) {
      brokenLinks.push({ saleId: sale.id, issue: 'Missing Category', productId: sale.productId, subCategoryId: product.subCategoryId, categoryId: subCategory.categoryId });
      continue;
    }
    const mainCategory = await prisma.mainCategory.findUnique({ where: { id: category.mainCategoryId } });
    if (!mainCategory) {
      brokenLinks.push({ saleId: sale.id, issue: 'Missing MainCategory', productId: sale.productId, subCategoryId: product.subCategoryId, categoryId: subCategory.categoryId, mainCategoryId: category.mainCategoryId });
      continue;
    }
  }
  console.log(`Broken relationships found in last 7 days: ${brokenLinks.length}`);
  if (brokenLinks.length > 0) {
    console.table(brokenLinks.slice(0, 10));
  }

  // 5. Revenue by main category for the last 6 months
  console.log('\nRevenue by main category for the last 6 months:');
  const allSales = await prisma.sale.findMany({
    where: {
      createdAt: {
        gte: subMonths(now, 5),
        lte: now,
      },
    },
    select: {
      salePrice: true,
      createdAt: true,
      product: {
        select: {
          subCategory: {
            select: {
              category: {
                select: {
                  mainCategory: {
                    select: { title: true },
                  },
                },
                title: true,
              },
            },
          },
        },
      },
    },
  });
  const revenueByMonth: Record<string, Record<string, number>> = {};
  for (let i = 0; i < 6; i++) {
    const monthDate = subMonths(now, i);
    const monthKey = format(monthDate, 'MMMM');
    revenueByMonth[monthKey] = {};
  }
  allSales.forEach((sale) => {
    const month = format(sale.createdAt, 'MMMM');
    const mainCategory = sale.product?.subCategory?.category?.mainCategory?.title || 'Unknown';
    if (!revenueByMonth[month][mainCategory]) {
      revenueByMonth[month][mainCategory] = 0;
    }
    revenueByMonth[month][mainCategory] += sale.salePrice || 0;
  });
  Object.entries(revenueByMonth).forEach(([month, categories]) => {
    console.log(`\n${month}:`);
    Object.entries(categories).forEach(([cat, revenue]) => {
      console.log(`  ${cat}: ${revenue}`);
    });
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
}); 