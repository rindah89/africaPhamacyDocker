"use client";

import { getRevenueByMainCategoryPastSixMonths, getSalesCountForPastSevenDays } from "@/actions/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import dynamic from 'next/dynamic';
import { ErrorBoundary } from "../ErrorBoundary";
import { DailySales, MonthlyMainCategoryRevenue } from "@/actions/analytics";

console.log('ChartsSection: Module initialization');

// Dynamically import chart components with SSR disabled
const SalesChart = dynamic(
  () => {
    console.log('ChartsSection: Loading SalesChart dynamically');
    return import('./SalesChart').catch(err => {
      console.error('ChartsSection: Failed to load SalesChart:', err);
      throw err;
    });
  },
  { 
    ssr: false,
    loading: () => {
      console.log('ChartsSection: Showing SalesChart loading state');
      return <ChartSkeleton />;
    }
  }
);

const RevenueByCategory = dynamic(
  () => {
    console.log('ChartsSection: Loading RevenueByCategory dynamically');
    return import('./RevenueByCategory').catch(err => {
      console.error('ChartsSection: Failed to load RevenueByCategory:', err);
      throw err;
    });
  },
  { 
    ssr: false,
    loading: () => {
      console.log('ChartsSection: Showing RevenueByCategory loading state');
      return <ChartSkeleton />;
    }
  }
);

function ChartSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <Skeleton className="h-[300px]" />
    </div>
  );
}

export function ChartsSection() {
  console.log('ChartsSection: Component rendering');
  
  const [sales, setSales] = useState<DailySales[] | null>(null);
  const [categoryRevenue, setCategoryRevenue] = useState<MonthlyMainCategoryRevenue[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('ChartsSection: useEffect triggered');
    
    async function loadData() {
      console.log('ChartsSection: Starting data fetch');
      try {
        console.log('ChartsSection: Fetching sales and revenue data...');
        const [salesData, revenueData] = await Promise.all([
          getSalesCountForPastSevenDays().catch(err => {
            console.error('ChartsSection: Failed to fetch sales data:', err);
            throw err;
          }),
          getRevenueByMainCategoryPastSixMonths().catch(err => {
            console.error('ChartsSection: Failed to fetch revenue data:', err);
            throw err;
          })
        ]);

        console.log('ChartsSection: Sales data received:', JSON.stringify(salesData, null, 2));
        console.log('ChartsSection: Revenue data received:', JSON.stringify(revenueData, null, 2));

        if (!salesData || !revenueData) {
          throw new Error("Failed to load charts data");
        }

        setSales(salesData);
        setCategoryRevenue(revenueData);
        console.log('ChartsSection: State updated with new data');
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        console.error("ChartsSection: Error loading charts:", error);
        setError(error);
      } finally {
        setLoading(false);
        console.log('ChartsSection: Loading complete');
      }
    }

    loadData();

    return () => {
      console.log('ChartsSection: Component cleanup');
    };
  }, []);

  if (loading) {
    console.log('ChartsSection: Rendering loading skeleton');
    return <ChartsSkeleton />;
  }

  if (error) {
    console.log('ChartsSection: Rendering error state:', error);
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  console.log('ChartsSection: Preparing to render charts with data:', {
    salesDataPresent: !!sales,
    salesDataLength: sales?.length ?? 0,
    revenueDataPresent: !!categoryRevenue,
    revenueDataLength: categoryRevenue?.length ?? 0
  });

  // Log data before rendering
  if (sales) {
    console.log('ChartsSection: Rendering SalesChart with data:', JSON.stringify(sales, null, 2));
  }
  if (categoryRevenue) {
    console.log('ChartsSection: Rendering RevenueByCategory with data:', JSON.stringify(categoryRevenue, null, 2));
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ErrorBoundary>
        {sales && (
          <div className="w-full">
            <SalesChart sales={sales} />
          </div>
        )}
      </ErrorBoundary>
      <ErrorBoundary>
        {categoryRevenue && (
          <div className="w-full">
            <RevenueByCategory categoryRevenueData={categoryRevenue} />
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
}

export function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  );
} 