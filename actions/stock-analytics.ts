"use server";

import { withCache, cacheKeys } from "@/lib/cache";
import { executeWithConnectionRetry } from "@/lib/db-health";
import prisma from "@/lib/db";
import { subMonths, format, startOfMonth, endOfMonth } from "date-fns";

export interface StockAnalyticsData {
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

export interface MonthlyData {
  month: string;
  sales: number;
  revenue: number;
  avgPrice: number;
}

export interface StockAnalyticsSummary {
  totalProducts: number;
  totalCurrentStock: number;
  totalOptimalStock: number;
  stockEfficiency: number;
  overstockedProducts: number;
  understockedProducts: number;
}

export interface StockAnalyticsResponse {
  products: StockAnalyticsData[];
  summary: StockAnalyticsSummary;
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

/**
 * Fetch comprehensive stock analytics data using server actions
 */
export const getStockAnalytics = async (page: number = 1, limit: number = 50): Promise<StockAnalyticsResponse> => {
  console.log(`🔍 getStockAnalytics - Server action called (page: ${page}, limit: ${limit})`);
  
  const cacheKey = `stock-analytics:page-${page}-limit-${limit}`;
  
  return withCache(cacheKey, async () => {
    console.log('🔍 getStockAnalytics - Cache miss, fetching from database');
    
    return executeWithConnectionRetry(async () => {
      try {
        // Get pagination parameters
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
          },
          orderBy: { name: 'asc' },
        });

        const analyticsResults: StockAnalyticsData[] = [];
        
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
        
        const response: StockAnalyticsResponse = {
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
        
        console.log(`🔍 getStockAnalytics - Successfully processed ${analyticsResults.length} products (page ${page}/${totalPages})`);
        
        // Ensure all data is properly serializable
        return JSON.parse(JSON.stringify(response));
        
      } catch (error) {
        console.error('🔍 getStockAnalytics - Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        
        return {
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
        };
      }
    }, 'Stock analytics fetch');
  }, 5 * 60 * 1000); // 5 minutes cache
};

/**
 * Get stock analytics for a specific product
 */
export const getProductStockAnalytics = async (productId: string): Promise<StockAnalyticsData | null> => {
  console.log('🔍 getProductStockAnalytics - Server action called for product:', productId);
  
  const cacheKey = `stock-analytics:product:${productId}`;
  
  return withCache(cacheKey, async () => {
    const allAnalytics = await getStockAnalytics(1, 1000); // Get more results for individual product lookup

    if (!allAnalytics.success) {
      throw new Error(allAnalytics.error || 'Failed to fetch product stock analytics');
    }
    
    const productAnalytics = allAnalytics.products.find(p => p.productId === productId);
    
    if (!productAnalytics) {
      console.warn(`🔍 getProductStockAnalytics - Product ${productId} not found in analytics`);
      return null;
    }
    
    console.log(`🔍 getProductStockAnalytics - Found analytics for product: ${productAnalytics.productName}`);
    
    // Ensure data is properly serializable
    return JSON.parse(JSON.stringify(productAnalytics));
  }, 15 * 60 * 1000); // 15 minutes cache
};

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
  if (values.length === 0) return 0;
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
  
  // Avoid division by zero
  if (firstHalfAvg === 0) {
    return secondHalfAvg > 0 ? 'increasing' : 'stable';
  }
  
  const changePercentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
  
  // Handle NaN and Infinity cases
  if (!isFinite(changePercentage)) return 'stable';
  
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
  // Validate inputs
  if (averageMonthlySales < 0 || productCost < 0) return 0;
  if (averageMonthlySales === 0) return 0;
  
  // Economic Order Quantity formula: sqrt((2 * demand * ordering cost) / holding cost)
  const annualDemand = averageMonthlySales * 12;
  const orderingCost = 50; // Assumed ordering cost
  const holdingCostRate = 0.2; // 20% of product cost per year
  const holdingCost = productCost * holdingCostRate;
  
  if (holdingCost <= 0) return averageMonthlySales * 2; // Fallback
  
  const eoq = Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
  return isFinite(eoq) ? eoq : averageMonthlySales * 2;
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
  
  // Handle division by zero and ensure valid calculations
  if (optimalStock <= 0) {
    if (currentStock > 0) {
      recommendations.push('📊 No optimal stock baseline - Review calculation parameters');
    }
    // Skip percentage-based recommendations when optimalStock is invalid
  } else {
    const stockDifferencePercentage = (stockDifference / optimalStock) * 100;
    
    // Only proceed with percentage-based recommendations if calculation is valid
    if (isFinite(stockDifferencePercentage)) {
  
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
    }
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

function calculateSummaryStatistics(products: StockAnalyticsData[]) {
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

/**
 * Get products filtered by ABC category
 */
export const getProductsByABCCategory = async (category: 'A' | 'B' | 'C'): Promise<StockAnalyticsData[]> => {
  console.log('🔍 getProductsByABCCategory - Server action called for category:', category);
  
  const cacheKey = `stock-analytics:abc-category:${category}`;
  
  return withCache(cacheKey, async () => {
    const allAnalytics = await getStockAnalytics(1, 1000); // Get more results for category filtering

    if (!allAnalytics.success) {
      throw new Error(allAnalytics.error || 'Failed to fetch ABC category analytics');
    }
    
    const categoryProducts = allAnalytics.products.filter(p => p.abcCategory === category);
    
    console.log(`🔍 getProductsByABCCategory - Found ${categoryProducts.length} products in category ${category}`);
    
    // Ensure data is properly serializable
    return JSON.parse(JSON.stringify(categoryProducts));
  }, 15 * 60 * 1000); // 15 minutes cache
};

/**
 * Get products that need immediate attention (overstocked, understocked, or critical)
 */
export const getCriticalStockProducts = async (): Promise<{
  overstocked: StockAnalyticsData[];
  understocked: StockAnalyticsData[];
  critical: StockAnalyticsData[];
}> => {
  console.log('🔍 getCriticalStockProducts - Server action called');
  
  const cacheKey = 'stock-analytics:critical-products';
  
  return withCache(cacheKey, async () => {
    const allAnalytics = await getStockAnalytics(1, 1000); // Get more results for critical stock analysis

    if (!allAnalytics.success) {
      throw new Error(allAnalytics.error || 'Failed to fetch critical stock products');
    }
    
    const overstocked = allAnalytics.products.filter(p => 
      p.currentStock > p.optimalStock * 1.5
    );
    
    const understocked = allAnalytics.products.filter(p => 
      p.currentStock < p.optimalStock * 0.75
    );
    
    const critical = allAnalytics.products.filter(p => 
      p.currentStock <= p.alertQty || p.currentStock < p.reorderPoint
    );
    
    console.log(`🔍 getCriticalStockProducts - Found ${overstocked.length} overstocked, ${understocked.length} understocked, ${critical.length} critical products`);
    
    const result = {
      overstocked,
      understocked,
      critical,
    };
    
    // Ensure data is properly serializable
    return JSON.parse(JSON.stringify(result));
  }, 10 * 60 * 1000); // 10 minutes cache for critical data
};

/**
 * Get stock analytics summary metrics
 */
export const getStockAnalyticsSummary = async (): Promise<StockAnalyticsSummary> => {
  console.log('🔍 getStockAnalyticsSummary - Server action called');
  
  const cacheKey = 'stock-analytics:summary';
  
  return withCache(cacheKey, async () => {
    const allAnalytics = await getStockAnalytics();
    
    if (!allAnalytics.success) {
      throw new Error(allAnalytics.error || 'Failed to fetch stock analytics summary');
    }
    
    console.log('🔍 getStockAnalyticsSummary - Retrieved summary:', allAnalytics.summary);
    
    // Ensure data is properly serializable
    return JSON.parse(JSON.stringify(allAnalytics.summary));
  }, 15 * 60 * 1000); // 15 minutes cache
};

/**
 * Get top performing products by sales volume
 */
export const getTopPerformingProducts = async (limit: number = 10): Promise<StockAnalyticsData[]> => {
  console.log('🔍 getTopPerformingProducts - Server action called with limit:', limit);
  
  const cacheKey = `stock-analytics:top-performers:${limit}`;
  
  return withCache(cacheKey, async () => {
    const allAnalytics = await getStockAnalytics();
    
    if (!allAnalytics.success) {
      throw new Error(allAnalytics.error || 'Failed to fetch top performing products');
    }
    
    const topProducts = allAnalytics.products
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, limit);
    
    console.log(`🔍 getTopPerformingProducts - Found ${topProducts.length} top performing products`);
    
    // Ensure data is properly serializable
    return JSON.parse(JSON.stringify(topProducts));
  }, 15 * 60 * 1000); // 15 minutes cache
};

/**
 * Get products with specific sales trends
 */
export const getProductsBySalesTrend = async (trend: 'increasing' | 'decreasing' | 'stable'): Promise<StockAnalyticsData[]> => {
  console.log('🔍 getProductsBySalesTrend - Server action called for trend:', trend);
  
  const cacheKey = `stock-analytics:sales-trend:${trend}`;
  
  return withCache(cacheKey, async () => {
    const allAnalytics = await getStockAnalytics();
    
    if (!allAnalytics.success) {
      throw new Error(allAnalytics.error || 'Failed to fetch products by sales trend');
    }
    
    const trendProducts = allAnalytics.products.filter(p => p.salesTrend === trend);
    
    console.log(`🔍 getProductsBySalesTrend - Found ${trendProducts.length} products with ${trend} trend`);
    
    // Ensure data is properly serializable
    return JSON.parse(JSON.stringify(trendProducts));
  }, 15 * 60 * 1000); // 15 minutes cache
};

/**
 * Get stock efficiency by category
 */
export const getStockEfficiencyByCategory = async (): Promise<{
  [category: string]: {
    totalProducts: number;
    averageEfficiency: number;
    overstockedCount: number;
    understockedCount: number;
  };
}> => {
  console.log('🔍 getStockEfficiencyByCategory - Server action called');
  
  const cacheKey = 'stock-analytics:efficiency-by-category';
  
  return withCache(cacheKey, async () => {
    const allAnalytics = await getStockAnalytics();
    
    if (!allAnalytics.success) {
      throw new Error(allAnalytics.error || 'Failed to fetch stock efficiency by category');
    }
    
    const categoryStats: { [category: string]: {
      totalProducts: number;
      averageEfficiency: number;
      overstockedCount: number;
      understockedCount: number;
    } } = {};
    
    // Group by ABC category
    ['A', 'B', 'C'].forEach(category => {
      const categoryProducts = allAnalytics.products.filter(p => p.abcCategory === category);
      
      if (categoryProducts.length > 0) {
        const totalEfficiency = categoryProducts.reduce((sum, p) => {
          const efficiency = p.optimalStock > 0 ? (p.currentStock / p.optimalStock) * 100 : 0;
          return sum + efficiency;
        }, 0);
        
        categoryStats[category] = {
          totalProducts: categoryProducts.length,
          averageEfficiency: Math.round((totalEfficiency / categoryProducts.length) * 100) / 100,
          overstockedCount: categoryProducts.filter(p => p.currentStock > p.optimalStock * 1.25).length,
          understockedCount: categoryProducts.filter(p => p.currentStock < p.optimalStock * 0.75).length,
        };
      }
    });
    
    console.log('🔍 getStockEfficiencyByCategory - Calculated efficiency stats:', categoryStats);
    
    // Ensure data is properly serializable
    return JSON.parse(JSON.stringify(categoryStats));
  }, 15 * 60 * 1000); // 15 minutes cache
}; 