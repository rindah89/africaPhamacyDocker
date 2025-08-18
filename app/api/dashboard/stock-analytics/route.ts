import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { subMonths, format, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";

interface ProductSalesData {
  productId: string;
  productName: string;
  productCode: string;
  currentStock: number;
  alertQty: number;
  productCost: number;
  productPrice: number;
  monthlySales: MonthlyData[];
  totalSales: number;
  averageMonthlySales: number;
  salesTrend: 'increasing' | 'decreasing' | 'stable';
  demandVariability: number;
  optimalStock: number;
  safetyStock: number;
  reorderPoint: number;
  economicOrderQuantity: number;
  abcCategory: 'A' | 'B' | 'C';
  recommendations: string[];
}

interface MonthlyData {
  month: string;
  sales: number;
  revenue: number;
  avgPrice: number;
}

interface StockAnalyticsResponse {
  products: ProductSalesData[];
  summary: {
    totalProducts: number;
    totalCurrentStock: number;
    totalOptimalStock: number;
    stockEfficiency: number;
    overstockedProducts: number;
    understockedProducts: number;
  };
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  success: boolean;
  error?: string;
}

export async function GET(request: NextRequest) {
  try {
    console.log('Stock Analytics API: Starting optimized stock analysis');
    
    // Get pagination parameters
    const url = new URL(request.url);
    const pageParam = parseInt(url.searchParams.get('page') || '1');
    const limitParam = parseInt(url.searchParams.get('limit') || '25');
    const q = (url.searchParams.get('q') || '').trim();
    const mode = url.searchParams.get('mode') || 'full';
    const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.floor(limitParam) : 25;
    const skip = Math.max(0, (page - 1) * limit);
    
    // Get date range (last 6 months)
    const currentDate = new Date();
    const sixMonthsAgo = subMonths(currentDate, 6);
    
    // First, get the total count for pagination
    const whereFilter = q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' as const } },
            { productCode: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const totalProducts = await prisma.product.count({ where: whereFilter });

    // Fast mode: skip heavy joins, return minimal data to avoid timeouts
    if (mode === 'fast') {
      const productsFast = await prisma.product.findMany({
        where: whereFilter,
        skip: skip ?? 0,
        take: limit,
        select: {
          id: true,
          name: true,
          productCode: true,
          stockQty: true,
          alertQty: true,
          productCost: true,
          productPrice: true,
        },
        orderBy: { id: 'asc' },
      });

      const analyticsResults: ProductSalesData[] = productsFast.map(p => ({
        productId: p.id,
        productName: p.name,
        productCode: p.productCode,
        currentStock: p.stockQty,
        alertQty: p.alertQty,
        productCost: p.productCost,
        productPrice: p.productPrice,
        monthlySales: [],
        totalSales: 0,
        averageMonthlySales: 0,
        salesTrend: 'stable',
        demandVariability: 0,
        optimalStock: p.stockQty,
        safetyStock: 0,
        reorderPoint: 0,
        economicOrderQuantity: 0,
        abcCategory: 'C',
        recommendations: [],
      }));

      const summary = {
        totalProducts: analyticsResults.length,
        totalCurrentStock: analyticsResults.reduce((s, x) => s + x.currentStock, 0),
        totalOptimalStock: analyticsResults.reduce((s, x) => s + x.optimalStock, 0),
        stockEfficiency: 100,
        overstockedProducts: 0,
        understockedProducts: 0,
      };

      const totalPages = Math.ceil(totalProducts / limit);
      return NextResponse.json({
        products: analyticsResults,
        summary,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
        success: true,
      });
    }

    // Fetch products with pagination and minimal sales data
    const products = await prisma.product.findMany({
      where: whereFilter,
      skip: skip ?? 0,
      take: limit,
      select: {
        id: true,
        name: true,
        productCode: true,
        stockQty: true,
        alertQty: true,
        productCost: true,
        productPrice: true,
        sales: {
          where: {
            createdAt: {
              gte: sixMonthsAgo,
              lte: currentDate,
            },
          },
          select: {
            qty: true,
            salePrice: true,
            createdAt: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    const analyticsResults: ProductSalesData[] = [];
    
    for (const product of products) {
      const monthlySales = calculateMonthlySales(product.sales, sixMonthsAgo, currentDate);
      const totalSales = monthlySales.reduce((sum, month) => sum + month.sales, 0);
      const averageMonthlySales = totalSales / 6;
      
      // Calculate demand variability (coefficient of variation)
      const salesValues = monthlySales.map(m => m.sales);
      const variance = calculateVariance(salesValues);
      const standardDeviation = Math.sqrt(variance);
      const demandVariability = averageMonthlySales > 0 ? standardDeviation / averageMonthlySales : 0;
      
      // Calculate sales trend
      const salesTrend = calculateSalesTrend(monthlySales);
      
      // Calculate optimal stock metrics
      const safetyStock = calculateSafetyStock(averageMonthlySales, demandVariability);
      const reorderPoint = calculateReorderPoint(averageMonthlySales, safetyStock);
      const economicOrderQuantity = calculateEOQ(averageMonthlySales, product.productCost);
      const optimalStock = calculateOptimalStock(averageMonthlySales, safetyStock, economicOrderQuantity);
      
      // Generate recommendations
      const recommendations = generateRecommendations(
        product.stockQty,
        optimalStock,
        averageMonthlySales,
        product.alertQty,
        demandVariability
      );
      
      analyticsResults.push({
        productId: product.id,
        productName: product.name,
        productCode: product.productCode,
        currentStock: product.stockQty,
        alertQty: product.alertQty,
        productCost: product.productCost,
        productPrice: product.productPrice,
        monthlySales,
        totalSales,
        averageMonthlySales: Math.round(averageMonthlySales * 100) / 100,
        salesTrend,
        demandVariability: Math.round(demandVariability * 100) / 100,
        optimalStock: Math.round(optimalStock),
        safetyStock: Math.round(safetyStock),
        reorderPoint: Math.round(reorderPoint),
        economicOrderQuantity: Math.round(economicOrderQuantity),
        abcCategory: 'A', // Will be calculated after all products are processed
        recommendations,
      });
    }
    
    // Calculate ABC categories
    const sortedByRevenue = analyticsResults.sort((a, b) => {
      const aRevenue = a.monthlySales.reduce((sum, month) => sum + month.revenue, 0);
      const bRevenue = b.monthlySales.reduce((sum, month) => sum + month.revenue, 0);
      return bRevenue - aRevenue;
    });
    
    const totalAnalyzedProducts = analyticsResults.length;
    const aThreshold = Math.floor(totalAnalyzedProducts * 0.2); // Top 20%
    const bThreshold = Math.floor(totalAnalyzedProducts * 0.5); // Next 30%
    
    sortedByRevenue.forEach((product, index) => {
      if (index < aThreshold) {
        product.abcCategory = 'A';
      } else if (index < bThreshold) {
        product.abcCategory = 'B';
      } else {
        product.abcCategory = 'C';
      }
    });
    
    // Calculate summary statistics for this page
    const summary = calculateSummaryStatistics(analyticsResults);
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    
    const response = {
      products: analyticsResults,
      summary,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        limit,
        hasNextPage,
        hasPreviousPage,
      },
      success: true,
    };
    
    console.log(`Stock Analytics API: Successfully processed ${analyticsResults.length} products (page ${page}/${totalPages})`);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Stock Analytics API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return NextResponse.json({
      products: [],
      summary: {
        totalProducts: 0,
        totalCurrentStock: 0,
        totalOptimalStock: 0,
        stockEfficiency: 0,
        overstockedProducts: 0,
        understockedProducts: 0,
      },
      success: false,
      error: `Stock analytics failed: ${errorMessage}`,
    }, { status: 500 });
  }
}

// Helper functions for stock analytics calculations

function calculateMonthlySales(sales: any[], startDate: Date, endDate: Date): MonthlyData[] {
  // Aggregate in a single pass by month for better performance
  const aggregatedByMonth: Record<string, { sales: number; revenue: number }> = {};
  const periodStart = startOfMonth(startDate);
  const periodEnd = endOfMonth(endDate);

  for (const sale of sales) {
    const saleDate = new Date(sale.createdAt);
    if (saleDate < periodStart || saleDate > periodEnd) continue;
    const key = format(startOfMonth(saleDate), 'MMM yyyy');
    if (!aggregatedByMonth[key]) {
      aggregatedByMonth[key] = { sales: 0, revenue: 0 };
    }
    aggregatedByMonth[key].sales += sale.qty;
    aggregatedByMonth[key].revenue += sale.qty * sale.salePrice;
  }

  const months: MonthlyData[] = [];
  let cursor = periodStart;
  while (cursor <= periodEnd) {
    const label = format(cursor, 'MMM yyyy');
    const entry = aggregatedByMonth[label] || { sales: 0, revenue: 0 };
    const avgPrice = entry.sales > 0 ? entry.revenue / entry.sales : 0;
    months.push({
      month: label,
      sales: entry.sales,
      revenue: entry.revenue,
      avgPrice,
    });
    cursor = subMonths(cursor, -1);
  }

  return months;
}

function calculateVariance(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
}

function calculateSalesTrend(monthlySales: MonthlyData[]): 'increasing' | 'decreasing' | 'stable' {
  if (monthlySales.length < 2) return 'stable';
  
  const firstHalf = monthlySales.slice(0, Math.floor(monthlySales.length / 2));
  const secondHalf = monthlySales.slice(Math.floor(monthlySales.length / 2));
  
  const firstHalfAvg = firstHalf.reduce((sum, month) => sum + month.sales, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, month) => sum + month.sales, 0) / secondHalf.length;
  
  const changePercentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
  
  if (changePercentage > 10) return 'increasing';
  if (changePercentage < -10) return 'decreasing';
  return 'stable';
}

function calculateSafetyStock(averageMonthlySales: number, demandVariability: number): number {
  // Safety stock = Z-score * sqrt(lead time) * std deviation of demand
  // Using Z-score of 1.65 for 95% service level
  const zScore = 1.65;
  const leadTimeMonths = 0.5; // Assuming 2 weeks lead time
  const standardDeviation = averageMonthlySales * demandVariability;
  
  return zScore * Math.sqrt(leadTimeMonths) * standardDeviation;
}

function calculateReorderPoint(averageMonthlySales: number, safetyStock: number): number {
  const leadTimeMonths = 0.5; // 2 weeks
  const leadTimeDemand = averageMonthlySales * leadTimeMonths;
  return leadTimeDemand + safetyStock;
}

function calculateEOQ(averageMonthlySales: number, productCost: number): number {
  // Economic Order Quantity formula: sqrt((2 * demand * ordering cost) / holding cost)
  const annualDemand = averageMonthlySales * 12;
  const orderingCost = 50; // Assumed ordering cost
  const holdingCostRate = 0.2; // 20% of product cost per year
  const holdingCost = productCost * holdingCostRate;
  
  if (holdingCost === 0) return averageMonthlySales * 2; // Fallback
  
  return Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
}

function calculateOptimalStock(averageMonthlySales: number, safetyStock: number, eoq: number): number {
  // Optimal stock = Safety stock + Average inventory (EOQ/2) + Buffer for demand variations
  const averageInventory = eoq / 2;
  const demandBuffer = averageMonthlySales * 0.5; // Half month buffer
  
  return safetyStock + averageInventory + demandBuffer;
}

function generateRecommendations(
  currentStock: number,
  optimalStock: number,
  averageMonthlySales: number,
  alertQty: number,
  demandVariability: number
): string[] {
  const recommendations: string[] = [];
  
  const stockDifference = currentStock - optimalStock;
  const stockDifferencePercentage = (stockDifference / optimalStock) * 100;
  
  if (stockDifferencePercentage > 50) {
    recommendations.push('⚠️ Significantly overstocked - Consider reducing orders');
  } else if (stockDifferencePercentage > 25) {
    recommendations.push('📊 Moderately overstocked - Monitor closely');
  } else if (stockDifferencePercentage < -50) {
    recommendations.push('🚨 Critically understocked - Immediate reorder required');
  } else if (stockDifferencePercentage < -25) {
    recommendations.push('⚡ Understocked - Consider increasing stock levels');
  } else {
    recommendations.push('✅ Stock levels are optimal');
  }
  
  if (currentStock <= alertQty) {
    recommendations.push('🔔 Below alert quantity - Reorder soon');
  }
  
  if (demandVariability > 0.5) {
    recommendations.push('📈 High demand variability - Consider increasing safety stock');
  }
  
  if (averageMonthlySales === 0) {
    recommendations.push('⭕ No sales in 6 months - Consider discontinuing or marketing');
  } else if (averageMonthlySales < 1) {
    recommendations.push('🐌 Very low sales volume - Review pricing and marketing');
  }
  
  return recommendations;
}

function calculateSummaryStatistics(products: ProductSalesData[]) {
  const totalProducts = products.length;
  const totalCurrentStock = products.reduce((sum, p) => sum + p.currentStock, 0);
  const totalOptimalStock = products.reduce((sum, p) => sum + p.optimalStock, 0);
  
  const stockEfficiency = totalOptimalStock > 0 ? (totalCurrentStock / totalOptimalStock) * 100 : 0;
  
  const overstockedProducts = products.filter(p => p.currentStock > p.optimalStock * 1.25).length;
  const understockedProducts = products.filter(p => p.currentStock < p.optimalStock * 0.75).length;
  
  return {
    totalProducts,
    totalCurrentStock,
    totalOptimalStock: Math.round(totalOptimalStock),
    stockEfficiency: Math.round(stockEfficiency * 100) / 100,
    overstockedProducts,
    understockedProducts,
  };
} 