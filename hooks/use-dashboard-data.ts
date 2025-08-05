"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { withSmartCache } from "@/lib/smart-cache";
import { getAnalytics, getSalesCountForPastSevenDays, getRevenueByMainCategoryPastSixMonths } from "@/actions/analytics";

export interface AnalyticsProps {
  title: string;
  count: number;
  detailLink: string;
  countUnit?: "" | undefined;
  iconName: string;
}

export interface DailySales {
  day: string;
  sales: number;
}

export interface MonthlyMainCategoryRevenue {
  month: string;
  [category: string]: number | string;
}

// Query keys for consistent cache management
export const dashboardKeys = {
  all: ['dashboard'] as const,
  analytics: () => [...dashboardKeys.all, 'analytics'] as const,
  charts: () => [...dashboardKeys.all, 'charts'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
  liveData: () => [...dashboardKeys.all, 'live-data'] as const,
};

// Enhanced hook for analytics data with React Query - Optimized for serverless
export function useAnalytics() {
  const query = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      try {
        // Try fast mode first for initial loads
        const fastResponse = await fetch('/api/dashboard/analytics?mode=fast', {
          headers: {
            'Cache-Control': 'max-age=300' // 5 minutes client cache
          }
        });
        
        if (fastResponse.ok) {
          const fastData = await fastResponse.json();
          if (fastData.mode === 'fast' && fastData.summary) {
            // Transform summary data to match expected format
            return [{
              title: "Total Sales (30 days)",
              count: fastData.summary.totalSales || 0,
              countUnit: "",
              detailLink: "/dashboard/sales",
              iconName: "BarChartHorizontal",
            }, {
              title: "Total Revenue",
              count: fastData.summary.totalRevenue || 0,
              countUnit: "",
              detailLink: "/dashboard/sales",
              iconName: "DollarSign",
            }];
          }
        }
        
        // Fallback to full analytics with timeout protection
        const response = await fetch('/api/dashboard/analytics', {
          headers: {
            'Cache-Control': 'max-age=600' // 10 minutes client cache
          }
        });
        
        if (!response.ok) {
          throw new Error(`Analytics API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.fallback && result.summary) {
          console.warn('Using fallback analytics data due to timeout');
          // Transform fallback data to expected format
          return [{
            title: "Total Sales (30 days)",
            count: result.summary.totalSales || 0,
            countUnit: "",
            detailLink: "/dashboard/sales",
            iconName: "BarChartHorizontal",
          }];
        }
        
        if (!result || result.length === 0) {
          throw new Error('No analytics data available');
        }
        
        return result;
      } catch (error) {
        console.error('❌ Analytics fetch failed:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes for faster updates
    gcTime: 10 * 60 * 1000, // Keep in garbage collection for 10 minutes
    retry: 1, // Reduce retries for faster failure recovery
    retryDelay: 1000, // Quick retry delay
  });

  const result = {
    analytics: query.data as AnalyticsProps[] | undefined,
    loading: query.isLoading,
    error: query.error?.message || null,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };

  return result;
}

// Enhanced hook for charts data with React Query
export function useChartsData() {
  const { showError, autoRefresh, refreshInterval } = useDashboard();
  
  const query = useQuery({
    queryKey: dashboardKeys.charts(),
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const response = await fetch('/api/dashboard/charts', {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch charts data`);
        }
        
        return response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    },
    staleTime: 30 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchInterval: autoRefresh ? refreshInterval : false,
    onError: (error: Error) => {
      if (error.name === 'AbortError') {
        showError('Charts request timed out. Please try again.');
      } else {
        showError(`Failed to load charts: ${error.message}`);
      }
    },
    retry: (failureCount, error) => {
      if (error.name === 'AbortError') return false;
      return failureCount < 2;
    },
    // Provide fallback data on error
    select: (data) => ({
      salesData: data?.salesData || [],
      categoryRevenue: data?.categoryRevenue || [],
      success: data?.success ?? true,
    }),
  });

  return {
    salesData: query.data?.salesData || [],
    categoryRevenue: query.data?.categoryRevenue || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}

// Enhanced hook for dashboard summary data with React Query
export function useDashboardSummary() {
  const { showError, autoRefresh, refreshInterval } = useDashboard();
  
  const query = useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const response = await fetch('/api/dashboard/summary', {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch summary data`);
        }

        return response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    },
    staleTime: 30 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchInterval: autoRefresh ? refreshInterval : false,
    onError: (error: Error) => {
      if (error.name === 'AbortError') {
        showError('Summary request timed out. Please try again.');
      } else {
        showError(`Failed to load dashboard summary: ${error.message}`);
      }
    },
    retry: (failureCount, error) => {
      if (error.name === 'AbortError') return false;
      return failureCount < 2;
    },
    // Provide fallback data on error
    select: (data) => ({
      ordersData: data?.ordersData || [],
      bestSellingProducts: data?.bestSellingProducts || [],
      customersData: data?.customersData || [],
      success: data?.success ?? true,
    }),
  });

  return {
    ordersData: query.data?.ordersData || [],
    bestSellingProducts: query.data?.bestSellingProducts || [],
    customersData: query.data?.customersData || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}

// New hook for real-time dashboard updates
export function useLiveDashboardData() {
  const { showInfo } = useDashboard();
  
  const query = useQuery({
    queryKey: dashboardKeys.liveData(),
    queryFn: async () => {
      const response = await fetch('/api/dashboard/live-data');
      if (!response.ok) {
        throw new Error('Failed to fetch live data');
      }
      return response.json();
    },
    refetchInterval: 10 * 1000, // Update every 10 seconds for live data
    staleTime: 5 * 1000, // 5 seconds
    onSuccess: (data) => {
      if (data.hasUpdates) {
        showInfo('Dashboard data updated with latest information');
      }
    },
    retry: 1,
  });

  return {
    liveData: query.data,
    loading: query.isLoading,
    error: query.error?.message || null,
  };
}

// Hook for dashboard mutations (settings, preferences, etc.)
export function useDashboardMutations() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useDashboard();

  const updateSettings = useMutation({
    mutationFn: async (settings: any) => {
      const response = await fetch('/api/dashboard/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update settings');
      }
      
      return response.json();
    },
    onSuccess: () => {
      showSuccess('Dashboard settings updated successfully');
      // Invalidate and refetch all dashboard data
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
    onError: (error: Error) => {
      showError(`Failed to update settings: ${error.message}`);
    },
  });

  const refreshAllData = useMutation({
    mutationFn: async () => {
      // Invalidate all dashboard queries to force refetch
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      return true;
    },
    onSuccess: () => {
      showSuccess('Dashboard data refreshed');
    },
    onError: (error: Error) => {
      showError(`Failed to refresh data: ${error.message}`);
    },
  });

  return {
    updateSettings,
    refreshAllData,
  };
}

// Hook for optimistic updates (for immediate UI feedback)
export function useOptimisticDashboard() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useDashboard();

  const updateAnalyticsOptimistically = (newData: Partial<AnalyticsProps[]>) => {
    queryClient.setQueryData(dashboardKeys.analytics(), (old: AnalyticsProps[]) => {
      return old ? [...old, ...Object.values(newData)] : Object.values(newData);
    });
  };

  const revertOptimisticUpdate = () => {
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
  };

  return {
    updateAnalyticsOptimistically,
    revertOptimisticUpdate,
  };
}

// Update the sales chart hook
export function useSalesChart() {
  return useQuery({
    queryKey: ['salesChart'],
    queryFn: async () => {
      return withSmartCache(
        'analytics:sales:7days',
        () => getSalesCountForPastSevenDays(),
        { 
          ttl: 30 * 60 * 1000, // 30 minutes
          tags: ['analytics', 'sales'] 
        }
      );
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 45 * 60 * 1000,
    retry: 2
  });
}

// Update the revenue chart hook
export function useRevenueChart() {
  return useQuery({
    queryKey: ['revenueChart'],
    queryFn: async () => {
      return withSmartCache(
        'analytics:revenue:6months',
        () => getRevenueByMainCategoryPastSixMonths(),
        { 
          ttl: 30 * 60 * 1000, // 30 minutes
          tags: ['analytics', 'revenue'] 
        }
      );
    },
    staleTime: 20 * 60 * 1000,
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2
  });
} 