"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { startOfMonth, endOfDay } from "date-fns";
import { getSalesReport } from "@/actions/reports";
import { toast } from "sonner";

// Query keys for consistent cache management
export const salesKeys = {
  all: ['sales'] as const,
  reports: () => [...salesKeys.all, 'reports'] as const,
  report: (startDate?: Date, endDate?: Date) => 
    [...salesKeys.reports(), { startDate: startDate?.toISOString(), endDate: endDate?.toISOString() }] as const,
  liveData: () => [...salesKeys.all, 'live-data'] as const,
};

export interface SalesReportData {
  sales: any[];
  totals: {
    totalOrders: number;
    totalQuantity: number;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
  };
  dailySales: any[];
}

// Update the main sales report hook to use optimized endpoint
export function useSalesReport(dateRange: DateRange | undefined) {
  return useQuery({
    queryKey: ['salesReport', dateRange?.from?.toISOString(), dateRange?.to?.toISOString()],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) {
        throw new Error('Date range is required');
      }
      
      const params = new URLSearchParams({
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString()
      });

      const response = await fetch(`/api/dashboard/sales-data?${params}`);
      const data = await response.json();

      if (!data.success) {
        console.warn('Sales data fetch had issues:', data.error);
        // Still return the data even if there were issues
      }

      // Transform the optimized response to match expected format
      return {
        sales: data.sales || [],
        totals: {
          totalOrders: data.summary.totalSales,
          totalQuantity: data.summary.totalQuantity,
          totalRevenue: data.summary.totalRevenue,
          totalCost: 0, // Not available in optimized query
          totalProfit: data.summary.totalRevenue * 0.3 // Estimate 30% margin
        },
        dailySales: data.dailySales.map((day: any) => ({
          day: new Date(day.date + 'T00:00:00Z').toLocaleDateString('en-US', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
          }),
          sales: day.salesCount,
          revenue: day.revenue
        })),
        topProducts: data.topProducts
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's a date range error
      if (error instanceof Error && error.message.includes('required')) {
        return false;
      }
      return failureCount < 2;
    },
    enabled: !!(dateRange?.from && dateRange?.to)
  });
}

// Hook for real-time sales updates
export function useLiveSalesData(dateRange?: DateRange) {
  const startDate = dateRange?.from;
  const endDate = dateRange?.to;

  const query = useQuery({
    queryKey: salesKeys.liveData(),
    queryFn: async () => {
      const response = await fetch('/api/sales/live-data');
      if (!response.ok) {
        throw new Error('Failed to fetch live sales data');
      }
      return response.json();
    },
    enabled: !!(startDate && endDate),
    refetchInterval: 30 * 1000, // Update every 30 seconds
    staleTime: 10 * 1000, // 10 seconds
    onSuccess: (data) => {
      if (data.hasUpdates) {
        toast.info('New sales data available');
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

// Hook for sales mutations (exports, settings, etc.)
export function useSalesMutations() {
  const queryClient = useQueryClient();

  const exportPDF = useMutation({
    mutationFn: async ({ salesData, filename }: { salesData: any[], filename?: string }) => {
      // Import the export function dynamically to avoid SSR issues
      const { exportToPDF } = await import('@/app/(back-office)/dashboard/reports/sales/columns');
      exportToPDF(salesData);
      return true;
    },
    onSuccess: () => {
      toast.success('PDF exported successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to export PDF: ${error.message}`);
    },
  });

  const exportExcel = useMutation({
    mutationFn: async ({ 
      salesData, 
      filename,
      dateRange 
    }: { 
      salesData: any[], 
      filename: string,
      dateRange?: DateRange 
    }) => {
      // Import the export function dynamically
      const { default: exportSalesDataToExcel } = await import('@/lib/exportSalesDataToExcel');
      await exportSalesDataToExcel(salesData, filename);
      return true;
    },
    onSuccess: () => {
      toast.success('Excel file exported successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to export Excel file: ${error.message}`);
    },
  });

  const refreshAllSalesData = useMutation({
    mutationFn: async () => {
      // Invalidate all sales queries to force refetch
      await queryClient.invalidateQueries({ queryKey: salesKeys.all });
      return true;
    },
    onSuccess: () => {
      toast.success('Sales data refreshed');
    },
    onError: (error: Error) => {
      toast.error(`Failed to refresh data: ${error.message}`);
    },
  });

  return {
    exportPDF,
    exportExcel,
    refreshAllSalesData,
  };
}

// Hook for optimistic sales updates
export function useOptimisticSales() {
  const queryClient = useQueryClient();

  const updateSalesOptimistically = (updatedSale: any, dateRange?: DateRange) => {
    const queryKey = salesKeys.report(dateRange?.from, dateRange?.to);
    
    queryClient.setQueryData(queryKey, (old: SalesReportData | null) => {
      if (!old) return old;
      
      const updatedSales = old.sales.map(sale => 
        sale.id === updatedSale.id ? { ...sale, ...updatedSale } : sale
      );
      
      // Recalculate totals
      const newTotals = updatedSales.reduce((acc, sale) => {
        acc.orderIds.add(sale.orderId);
        return {
          orderIds: acc.orderIds,
          totalQuantity: acc.totalQuantity + sale.quantity,
          totalRevenue: acc.totalRevenue + sale.revenue,
          totalCost: acc.totalCost + sale.cost,
          totalProfit: acc.totalProfit + sale.profit
        };
      }, {
        orderIds: new Set<string>(),
        totalQuantity: 0,
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0
      });

      return {
        ...old,
        sales: updatedSales,
        totals: {
          totalOrders: newTotals.orderIds.size,
          totalQuantity: newTotals.totalQuantity,
          totalRevenue: newTotals.totalRevenue,
          totalCost: newTotals.totalCost,
          totalProfit: newTotals.totalProfit,
        }
      };
    });
  };

  const revertOptimisticUpdate = (dateRange?: DateRange) => {
    const queryKey = salesKeys.report(dateRange?.from, dateRange?.to);
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    updateSalesOptimistically,
    revertOptimisticUpdate,
  };
}

// Hook for default date range management
export function useDefaultDateRange() {
  const now = new Date();
  const defaultRange: DateRange = {
    from: startOfMonth(now),
    to: endOfDay(now)
  };

  return defaultRange;
} 