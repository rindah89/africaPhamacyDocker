"use server";

import { withCache, cacheKeys } from "@/lib/cache";
import { executeWithConnectionRetry } from "@/lib/db-health";

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
    console.log('🔍 getStockAnalytics - Cache miss, fetching from API');
    
    return executeWithConnectionRetry(async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/dashboard/stock-analytics?page=${page}&limit=${limit}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: StockAnalyticsResponse = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch stock analytics');
        }
        
        console.log(`🔍 getStockAnalytics - Successfully fetched data for ${data.products.length} products (page ${page})`);
        
        // Ensure all data is properly serializable
        return JSON.parse(JSON.stringify(data));
        
      } catch (error) {
        console.error('🔍 getStockAnalytics - Error:', error);
        throw error;
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