"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, TrendingUp, Download, FileSpreadsheet, Settings } from "lucide-react";
import SalesReport from "@/components/dashboard/Reports/SalesReport";
import SalesDateFilter from "@/components/dashboard/Reports/SalesDateFilter";
import { useSalesReport, useLiveSalesData, useSalesMutations, useDefaultDateRange } from "@/hooks/use-sales-data";
import { Toaster } from "sonner";

// Create a query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

interface SalesReportHeaderProps {
  dateRange: DateRange | undefined;
  isLoading: boolean;
  isRefetching: boolean;
  onRefresh: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
  exportingPDF: boolean;
  exportingExcel: boolean;
}

function SalesReportHeader({
  dateRange,
  isLoading,
  isRefetching,
  onRefresh,
  onExportPDF,
  onExportExcel,
  exportingPDF,
  exportingExcel,
}: SalesReportHeaderProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle>Sales Report</CardTitle>
            {isRefetching && (
              <Badge variant="secondary" className="animate-pulse gap-1">
                <TrendingUp className="h-3 w-3" />
                Updating...
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading || isRefetching}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${(isLoading || isRefetching) ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onExportExcel}
              disabled={isLoading || exportingExcel || !dateRange?.from || !dateRange?.to}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {exportingExcel ? 'Exporting...' : 'Excel'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onExportPDF}
              disabled={isLoading || exportingPDF || !dateRange?.from || !dateRange?.to}
            >
              <Download className="h-4 w-4 mr-2" />
              {exportingPDF ? 'Exporting...' : 'PDF'}
            </Button>
          </div>
        </div>
        
        {dateRange?.from && dateRange?.to && (
          <div className="text-sm text-muted-foreground">
            Report period: {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
          </div>
        )}
      </CardHeader>
    </Card>
  );
}

function SalesReportSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-[200px]" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-[80px]" />
              <Skeleton className="h-8 w-[80px]" />
              <Skeleton className="h-8 w-[80px]" />
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Summary Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-[120px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[100px]" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Charts Skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[180px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px]" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[180px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px]" />
          </CardContent>
        </Card>
      </div>
      
      {/* Table Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[150px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SalesReportContent() {
  const defaultDateRange = useDefaultDateRange();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(defaultDateRange);
  
  const { data: salesData, isLoading, error, isRefetching, refetch } = useSalesReport(dateRange);
  const { liveData } = useLiveSalesData(dateRange);
  const { exportPDF, exportExcel, refreshAllSalesData } = useSalesMutations();

  const handleRefresh = async () => {
    await refetch();
  };

  const handleRefreshAll = async () => {
    await refreshAllSalesData.mutateAsync();
  };

  const handleExportPDF = async () => {
    if (salesData && salesData.sales && Array.isArray(salesData.sales) && salesData.sales.length > 0) {
      await exportPDF.mutateAsync({ 
        salesData: salesData.sales 
      });
    }
  };

  const handleExportExcel = async () => {
    if (salesData && salesData.sales && Array.isArray(salesData.sales) && salesData.sales.length > 0) {
      const fromDate = dateRange?.from?.toLocaleDateString() || 'Unknown';
      const toDate = dateRange?.to?.toLocaleDateString() || 'Unknown';
      const filename = `Sales Report ${fromDate} to ${toDate}`;
      
      await exportExcel.mutateAsync({
        salesData: salesData.sales,
        filename,
        dateRange
      });
    }
  };

  if (isLoading && !salesData) {
    return (
      <div className="space-y-6">
        <SalesDateFilter
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          isLoading={true}
        />
        <SalesReportSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <SalesDateFilter
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          isLoading={false}
        />
        <Alert variant="destructive">
          <AlertDescription>
            {error?.message || 'An error occurred'}. Please try refreshing or selecting a different date range.
          </AlertDescription>
        </Alert>
        <Card>
          <CardContent className="text-center py-8">
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!salesData) {
    return (
      <div className="space-y-6">
        <SalesDateFilter
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-muted-foreground mb-4">
              No sales data available for the selected period.
            </div>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SalesReportHeader
        dateRange={dateRange}
        isLoading={isLoading}
        isRefetching={isRefetching}
        onRefresh={handleRefresh}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
        exportingPDF={exportPDF.isPending}
        exportingExcel={exportExcel.isPending}
      />
      
      <SalesDateFilter
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        isLoading={isLoading}
      />
      
      <SalesReport 
        sales={salesData?.sales || []} 
        totals={salesData?.totals || { totalOrders: 0, totalQuantity: 0, totalRevenue: 0, totalCost: 0, totalProfit: 0 }} 
        dailySales={salesData?.dailySales || []} 
      />
    </div>
  );
}

export default function SalesReportPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <main className="p-4 lg:p-6">
          <SalesReportContent />
        </main>
        <Toaster richColors position="top-right" />
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </div>
    </QueryClientProvider>
  );
} 