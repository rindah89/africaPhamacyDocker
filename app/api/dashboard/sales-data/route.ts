import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// Inline withTimeout utility
function withTimeout<T>(promiseFn: () => Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promiseFn(),
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms))
  ]);
}

export async function GET(request: NextRequest) {
  return withTimeout(async () => {
    try {
      console.log('Optimized sales data API called (MongoDB/Prisma)');
      const { searchParams } = new URL(request.url);
      const from = searchParams.get('from');
      const to = searchParams.get('to');
      
      if (!from || !to) {
        return NextResponse.json({ error: 'Date range required' }, { status: 400 });
      }

      const fromDate = new Date(from);
      const toDate = new Date(to);
      
      // Fetch all sales in the date range
      const sales = await prisma.sale.findMany({
        where: {
          createdAt: {
            gte: fromDate,
            lte: toDate,
          },
        },
        include: {
          product: true,
        },
      });

      // Sales summary
      const totalSales = sales.length;
      const totalRevenue = sales.reduce((sum, sale) => sum + (sale.salePrice * sale.qty), 0);
      const totalQuantity = sales.reduce((sum, sale) => sum + sale.qty, 0);
      const avgSalePrice = totalSales > 0 ? totalRevenue / totalQuantity : 0;

      // Top products
      const productMap = new Map();
      for (const sale of sales) {
        const key = sale.productId;
        if (!productMap.has(key)) {
          productMap.set(key, {
            name: sale.product?.name || '',
            productCode: sale.product?.productCode || '',
            salesCount: 0,
            totalQty: 0,
            revenue: 0,
          });
        }
        const prod = productMap.get(key);
        prod.salesCount += 1;
        prod.totalQty += sale.qty;
        prod.revenue += sale.salePrice * sale.qty;
      }
      const topProducts = Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Daily sales summary
      const dailyMap = new Map();
      for (const sale of sales) {
        const day = sale.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
        if (!dailyMap.has(day)) {
          dailyMap.set(day, {
            date: day,
            salesCount: 0,
            revenue: 0,
            quantity: 0,
          });
        }
        const daily = dailyMap.get(day);
        daily.salesCount += 1;
        daily.revenue += sale.salePrice * sale.qty;
        daily.quantity += sale.qty;
      }
      const dailySales = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

      // Map sales to the structure expected by the frontend
      const mappedSales = sales.map(sale => {
        const product = sale.product || {};
        return {
          date: sale.createdAt,
          orderNumber: sale.orderNumber || '',
          orderId: sale.orderId || '',
          customerName: sale.customerName || '',
          customerPhone: sale.customerPhone || '',
          productName: sale.productName || product.name || '',
          productCode: product.productCode || '',
          category: product.subCategory?.category?.title || '',
          subCategory: product.subCategory?.title || '',
          brand: product.brand?.title || '',
          quantity: sale.qty,
          unitPrice: sale.salePrice,
          revenue: sale.salePrice * sale.qty,
          cost: (product.productCost || 0) * sale.qty,
          profit: (sale.salePrice * sale.qty) - ((product.productCost || 0) * sale.qty),
        };
      });

      const summary = {
        totalSales,
        totalRevenue,
        totalQuantity,
        avgSalePrice,
      };

      return NextResponse.json({
        summary,
        topProducts,
        dailySales,
        sales: mappedSales,
        success: true,
      });
    } catch (error) {
      console.error('Optimized sales data API error:', error);
      return NextResponse.json({
        summary: { totalSales: 0, totalRevenue: 0, totalQuantity: 0, avgSalePrice: 0 },
        topProducts: [],
        dailySales: [],
        success: false,
        error: 'Database timeout or error - please try a smaller date range',
      }, { status: 200 });
    }
  }, 8000);
} 