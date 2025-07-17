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
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50'); // Reduced from all products
    const skip = (page - 1) * limit;
    
    // Get date range (last 6 months)
    const currentDate = new Date();
    const sixMonthsAgo = subMonths(currentDate, 6);
    
    // First, get the total count for pagination
    const totalProducts = await prisma.product.count();
    
    // Fetch products with pagination and minimal sales data
    const products = await prisma.product.findMany({
      skip,
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
        brand: { select: { title: true } },
        subCategory: { 
          select: { 
            title: true, 
            category: { 
              select: { 
                title: true, 
                mainCategory: { select: { title: true } } 
              } 
            } 
          } 
        },
      },
      orderBy: { name: 'asc' },
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
  const months = [];
  let currentMonth = startDate;
  
  while (currentMonth <= endDate) {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    const monthlySales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= monthStart && saleDate <= monthEnd;
    });
    
    const totalQty = monthlySales.reduce((sum, sale) => sum + sale.qty, 0);
    const totalRevenue = monthlySales.reduce((sum, sale) => sum + (sale.qty * sale.salePrice), 0);
    const avgPrice = totalQty > 0 ? totalRevenue / totalQty : 0;
    
    months.push({
      month: format(currentMonth, 'MMM yyyy'),
      sales: totalQty,
      revenue: totalRevenue,
      avgPrice,
    });
    
    currentMonth = subMonths(currentMonth, -1);
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