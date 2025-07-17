"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { 
  getStockAnalytics, 
  getProductStockAnalytics, 
  getProductsByABCCategory, 
  getCriticalStockProducts,
  getStockAnalyticsSummary,
  getTopPerformingProducts,
  getProductsBySalesTrend,
  getStockEfficiencyByCategory,
  StockAnalyticsResponse,
  StockAnalyticsData,
  StockAnalyticsSummary
} from "@/actions/stock-analytics";
import { withSmartCache } from "@/lib/smart-cache";

export interface UseStockAnalyticsOptions {
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  enabled?: boolean;
}

/**
 * Main hook for comprehensive stock analytics
 */
export function useStockAnalytics(options: UseStockAnalyticsOptions = {}) {
  const {
    staleTime = 15 * 60 * 1000, // 15 minutes
    gcTime = 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus = false,
    enabled = true
  } = options;

  return useQuery({
    queryKey: ['stock-analytics', 'comprehensive'],
    queryFn: async () => {
      console.log('🔍 useStockAnalytics - Fetching comprehensive stock analytics');
      
      const result = await getStockAnalytics();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch stock analytics');
      }
      
      console.log(`🔍 useStockAnalytics - Successfully fetched data for ${result.products.length} products`);
      return result;
    },
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    enabled,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
}

/**
 * Hook for getting stock analytics of a specific product
 */
export function useProductStockAnalytics(productId: string, options: UseStockAnalyticsOptions = {}) {
  const {
    staleTime = 15 * 60 * 1000,
    gcTime = 30 * 60 * 1000,
    refetchOnWindowFocus = false,
    enabled = true
  } = options;

  return useQuery({
    queryKey: ['stock-analytics', 'product', productId],
    queryFn: async () => {
      console.log('🔍 useProductStockAnalytics - Fetching product analytics for:', productId);
      
      const result = await getProductStockAnalytics(productId);
      
      if (!result) {
        throw new Error(`Product ${productId} not found in analytics`);
      }
      
      console.log(`🔍 useProductStockAnalytics - Successfully fetched analytics for: ${result.productName}`);
      return result;
    },
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    enabled: enabled && !!productId,
    retry: 2
  });
}

/**
 * Hook for getting products by ABC category
 */
export function useProductsByABCCategory(category: 'A' | 'B' | 'C', options: UseStockAnalyticsOptions = {}) {
  const {
    staleTime = 15 * 60 * 1000,
    gcTime = 30 * 60 * 1000,
    refetchOnWindowFocus = false,
    enabled = true
  } = options;

  return useQuery({
    queryKey: ['stock-analytics', 'abc-category', category],
    queryFn: async () => {
      console.log('🔍 useProductsByABCCategory - Fetching products for category:', category);
      
      const result = await getProductsByABCCategory(category);
      
      console.log(`🔍 useProductsByABCCategory - Found ${result.length} products in category ${category}`);
      return result;
    },
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    enabled: enabled && !!category,
    retry: 2
  });
}

/**
 * Hook for getting critical stock products
 */
export function useCriticalStockProducts(options: UseStockAnalyticsOptions = {}) {
  const {
    staleTime = 10 * 60 * 1000, // 10 minutes for critical data
    gcTime = 20 * 60 * 1000,
    refetchOnWindowFocus = false,
    enabled = true
  } = options;

  return useQuery({
    queryKey: ['stock-analytics', 'critical-products'],
    queryFn: async () => {
      console.log('🔍 useCriticalStockProducts - Fetching critical stock products');
      
      const result = await getCriticalStockProducts();
      
      console.log(`🔍 useCriticalStockProducts - Found ${result.critical.length} critical, ${result.understocked.length} understocked, ${result.overstocked.length} overstocked products`);
      return result;
    },
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    enabled,
    retry: 2
  });
}

/**
 * Hook for getting stock analytics summary
 */
export function useStockAnalyticsSummary(options: UseStockAnalyticsOptions = {}) {
  const {
    staleTime = 15 * 60 * 1000,
    gcTime = 30 * 60 * 1000,
    refetchOnWindowFocus = false,
    enabled = true
  } = options;

  return useQuery({
    queryKey: ['stock-analytics', 'summary'],
    queryFn: async () => {
      console.log('🔍 useStockAnalyticsSummary - Fetching stock analytics summary');
      
      const result = await getStockAnalyticsSummary();
      
      console.log('🔍 useStockAnalyticsSummary - Successfully fetched summary:', result);
      return result;
    },
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    enabled,
    retry: 2
  });
}

/**
 * Hook for getting top performing products
 */
export function useTopPerformingProducts(limit: number = 10, options: UseStockAnalyticsOptions = {}) {
  const {
    staleTime = 15 * 60 * 1000,
    gcTime = 30 * 60 * 1000,
    refetchOnWindowFocus = false,
    enabled = true
  } = options;

  return useQuery({
    queryKey: ['stock-analytics', 'top-performers', limit],
    queryFn: async () => {
      console.log('🔍 useTopPerformingProducts - Fetching top performing products with limit:', limit);
      
      const result = await getTopPerformingProducts(limit);
      
      console.log(`🔍 useTopPerformingProducts - Found ${result.length} top performing products`);
      return result;
    },
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    enabled,
    retry: 2
  });
}

/**
 * Hook for getting products by sales trend
 */
export function useProductsBySalesTrend(trend: 'increasing' | 'decreasing' | 'stable', options: UseStockAnalyticsOptions = {}) {
  const {
    staleTime = 15 * 60 * 1000,
    gcTime = 30 * 60 * 1000,
    refetchOnWindowFocus = false,
    enabled = true
  } = options;

  return useQuery({
    queryKey: ['stock-analytics', 'sales-trend', trend],
    queryFn: async () => {
      console.log('🔍 useProductsBySalesTrend - Fetching products with trend:', trend);
      
      const result = await getProductsBySalesTrend(trend);
      
      console.log(`🔍 useProductsBySalesTrend - Found ${result.length} products with ${trend} trend`);
      return result;
    },
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    enabled: enabled && !!trend,
    retry: 2
  });
}

/**
 * Hook for getting stock efficiency by category
 */
export function useStockEfficiencyByCategory(options: UseStockAnalyticsOptions = {}) {
  const {
    staleTime = 15 * 60 * 1000,
    gcTime = 30 * 60 * 1000,
    refetchOnWindowFocus = false,
    enabled = true
  } = options;

  return useQuery({
    queryKey: ['stock-analytics', 'efficiency-by-category'],
    queryFn: async () => {
      console.log('🔍 useStockEfficiencyByCategory - Fetching stock efficiency by category');
      
      const result = await getStockEfficiencyByCategory();
      
      console.log('🔍 useStockEfficiencyByCategory - Successfully fetched efficiency data:', result);
      return result;
    },
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    enabled,
    retry: 2
  });
}

/**
 * Hook for managing stock analytics mutations and cache invalidation
 */
export function useStockAnalyticsMutations() {
  const queryClient = useQueryClient();

  const refreshStockAnalytics = useMutation({
    mutationFn: async () => {
      console.log('🔄 useStockAnalyticsMutations - Refreshing stock analytics');
      
      // Invalidate all stock analytics queries
      await queryClient.invalidateQueries({ queryKey: ['stock-analytics'] });
      
      // Prefetch the main analytics data
      await queryClient.prefetchQuery({
        queryKey: ['stock-analytics', 'comprehensive'],
        queryFn: getStockAnalytics,
        staleTime: 15 * 60 * 1000
      });
      
      console.log('🔄 useStockAnalyticsMutations - Successfully refreshed stock analytics');
      return { success: true };
    },
    onSuccess: () => {
      console.log('✅ Stock analytics refreshed successfully');
    },
    onError: (error) => {
      console.error('❌ Failed to refresh stock analytics:', error);
    }
  });

  const prefetchStockAnalytics = useMutation({
    mutationFn: async () => {
      console.log('🔄 useStockAnalyticsMutations - Prefetching stock analytics');
      
      // Prefetch main analytics
      await queryClient.prefetchQuery({
        queryKey: ['stock-analytics', 'comprehensive'],
        queryFn: getStockAnalytics,
        staleTime: 15 * 60 * 1000
      });
      
      // Prefetch summary
      await queryClient.prefetchQuery({
        queryKey: ['stock-analytics', 'summary'],
        queryFn: getStockAnalyticsSummary,
        staleTime: 15 * 60 * 1000
      });
      
      // Prefetch critical products
      await queryClient.prefetchQuery({
        queryKey: ['stock-analytics', 'critical-products'],
        queryFn: getCriticalStockProducts,
        staleTime: 10 * 60 * 1000
      });
      
      console.log('🔄 useStockAnalyticsMutations - Successfully prefetched stock analytics');
      return { success: true };
    },
    onSuccess: () => {
      console.log('✅ Stock analytics prefetched successfully');
    },
    onError: (error) => {
      console.error('❌ Failed to prefetch stock analytics:', error);
    }
  });

  return {
    refreshStockAnalytics,
    prefetchStockAnalytics
  };
}

/**
 * Combined hook for all stock analytics data with loading states
 */
export function useStockAnalyticsData(options: UseStockAnalyticsOptions = {}) {
  const analytics = useStockAnalytics(options);
  const summary = useStockAnalyticsSummary(options);
  const criticalProducts = useCriticalStockProducts(options);
  const topProducts = useTopPerformingProducts(10, options);
  const mutations = useStockAnalyticsMutations();

  return {
    // Main data
    analytics: analytics.data,
    summary: summary.data,
    criticalProducts: criticalProducts.data,
    topProducts: topProducts.data,
    
    // Loading states
    isLoading: analytics.isLoading || summary.isLoading || criticalProducts.isLoading || topProducts.isLoading,
    isFetching: analytics.isFetching || summary.isFetching || criticalProducts.isFetching || topProducts.isFetching,
    isRefetching: analytics.isRefetching || summary.isRefetching || criticalProducts.isRefetching || topProducts.isRefetching,
    
    // Error states
    error: analytics.error || summary.error || criticalProducts.error || topProducts.error,
    
    // Refetch functions
    refetch: () => {
      analytics.refetch();
      summary.refetch();
      criticalProducts.refetch();
      topProducts.refetch();
    },
    
    // Mutations
    ...mutations
  };
}

/**
 * Hook for stock analytics with smart caching and background updates
 */
export function useSmartStockAnalytics(options: UseStockAnalyticsOptions = {}) {
  const {
    staleTime = 15 * 60 * 1000,
    gcTime = 30 * 60 * 1000,
    refetchOnWindowFocus = false,
    enabled = true
  } = options;

  return useQuery({
    queryKey: ['stock-analytics', 'smart-cached'],
    queryFn: async () => {
      console.log('🔍 useSmartStockAnalytics - Fetching with smart cache');
      
      return withSmartCache(
        'stock-analytics:comprehensive',
        async () => {
          const result = await getStockAnalytics();
          if (!result.success) {
            throw new Error(result.error || 'Failed to fetch stock analytics');
          }
          return result;
        },
        { 
          ttl: 15 * 60 * 1000, // 15 minutes
          tags: ['stock-analytics', 'inventory'] 
        }
      );
    },
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    enabled,
    retry: 2,
    refetchInterval: 5 * 60 * 1000, // Background refresh every 5 minutes
    refetchIntervalInBackground: true
  });
} 