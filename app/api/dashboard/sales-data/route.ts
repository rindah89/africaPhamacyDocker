import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    console.log('Production-ready MongoDB aggregation API call');
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    
    if (!from || !to) {
      return NextResponse.json({ error: 'Date range required' }, { status: 400 });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    const dateFilter = {
      $match: {
        createdAt: {
          $gte: { $date: from },
          $lte: { $date: to },
        },
      },
    };

    // 1. Paginated sales list for the table
    const salesPromise = prisma.sale.findMany({
      where: { createdAt: { gte: fromDate, lte: toDate } },
      include: {
        product: {
          include: { brand: true, subCategory: { include: { category: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    
    // 2. Summary statistics using the MongoDB aggregation pipeline
    const summaryPromise = prisma.sale.aggregateRaw({
      pipeline: [
        dateFilter,
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $multiply: ["$salePrice", "$qty"] } },
            totalQuantity: { $sum: "$qty" },
            totalSales: { $sum: 1 }
          },
        },
      ],
    });

    // 3. Daily sales breakdown
    const dailySalesPromise = prisma.sale.aggregateRaw({
      pipeline: [
        dateFilter,
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: { $multiply: ["$salePrice", "$qty"] } },
            quantity: { $sum: "$qty" },
            salesCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: "$_id", revenue: 1, quantity: 1, salesCount: 1 } }
      ],
    });

    // 4. Top 10 products
    const topProductsPromise = prisma.sale.aggregateRaw({
      pipeline: [
        dateFilter,
        {
          $group: {
            _id: "$productId",
            productName: { $first: "$productName" },
            totalQty: { $sum: "$qty" },
            revenue: { $sum: { $multiply: ["$salePrice", "$qty"] } },
            salesCount: { $sum: 1 }
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
      ],
    });

    const [
      sales, 
      summaryResult,
      dailySales,
      topProducts,
    ] = await Promise.all([
      salesPromise,
      summaryPromise,
      dailySalesPromise,
      topProductsPromise,
    ]);

    const summary: any = (summaryResult as any[])[0] || { totalRevenue: 0, totalQuantity: 0, totalSales: 0 };
    const avgSalePrice = summary.totalQuantity > 0 ? summary.totalRevenue / summary.totalQuantity : 0;
    const summaryData = { ...summary, avgSalePrice };
    
    const mappedSales = sales.map(sale => {
      const product = sale.product || {};
      const revenue = sale.salePrice * sale.qty;
      const cost = (product.productCost || 0) * sale.qty;
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
        revenue: revenue,
        cost: cost,
        profit: revenue - cost,
      };
    });

    return NextResponse.json({
      summary: summaryData,
      topProducts,
      dailySales,
      sales: mappedSales,
      success: true,
    });
  } catch (error) {
    console.error('Production sales data API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({
      summary: { totalSales: 0, totalRevenue: 0, totalQuantity: 0, avgSalePrice: 0 },
      topProducts: [],
      dailySales: [],
      sales: [],
      success: false,
      error: `Database query failed: ${errorMessage}`,
    }, { status: 500 });
  }
} 