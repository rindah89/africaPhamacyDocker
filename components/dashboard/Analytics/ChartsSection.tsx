"use client";

import { getRevenueByMainCategoryPastSixMonths, getSalesCountForPastSevenDays } from "@/actions/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import dynamic from 'next/dynamic';
import { ErrorBoundary } from "../ErrorBoundary";
import { DailySales, MonthlyMainCategoryRevenue } from "@/actions/analytics";

console.log('ChartsSection: Module initialization (Client)');

const SalesChart = dynamic(
  () => {
    console.log('ChartsSection: Loading SalesChart dynamically');
    return import('./SalesChart').catch(err => {
      console.error('ChartsSection: Failed to load SalesChart:', err);
      const ErrorComponent = () => <p>Error loading Sales Chart.</p>;
      ErrorComponent.displayName = 'SalesChartError';
      return ErrorComponent;
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
SalesChart.displayName = 'SalesChart';

const RevenueByCategory = dynamic(
  () => {
    console.log('ChartsSection: Loading RevenueByCategory dynamically');
    return import('./RevenueByCategory').catch(err => {
      console.error('ChartsSection: Failed to load RevenueByCategory:', err);
      const ErrorComponent = () => <p>Error loading Revenue By Category Chart.</p>;
      ErrorComponent.displayName = 'RevenueByCategoryError';
      return ErrorComponent;
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
RevenueByCategory.displayName = 'RevenueByCategory';

function ChartSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <Skeleton className="h-[300px]" />
    </div>
  );
}

export function ChartsSection() {
  console.log('ChartsSection: Component rendering (Client)');
  
  const [sales, setSales] = useState<DailySales[] | null>(null);
  const [categoryRevenue, setCategoryRevenue] = useState<MonthlyMainCategoryRevenue[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('ChartsSection: useEffect triggered');
    let isMounted = true; // Flag to prevent state updates if component is unmounted

    async function loadData() {
      console.log('ChartsSection: Starting data fetch (Client)');
      setLoading(true); // Ensure loading is true at the start of fetch
      try {
        console.log('ChartsSection: Fetching sales and revenue data (Client)...');
        const [salesDataResult, revenueDataResult] = await Promise.all([
          getSalesCountForPastSevenDays().catch(err => {
            console.error('ChartsSection: Failed to fetch sales data (Client):', err);
            // Return a specific error object or a marker to distinguish
            return err instanceof Error ? err : new Error('Failed to load sales data');
          }),
          getRevenueByMainCategoryPastSixMonths().catch(err => {
            console.error('ChartsSection: Failed to fetch revenue data (Client):', err);
            return err instanceof Error ? err : new Error('Failed to load revenue data');
          })
        ]);

        if (!isMounted) return; // Don't update state if unmounted

        let salesError: Error | null = null;
        let revenueError: Error | null = null;

        if (salesDataResult instanceof Error) {
          salesError = salesDataResult;
        } else {
          setSales(salesDataResult);
        }

        if (revenueDataResult instanceof Error) {
          revenueError = revenueDataResult;
        } else {
          setCategoryRevenue(revenueDataResult);
        }

        if (salesError && revenueError) {
          setError(new Error(`Sales: ${salesError.message}; Revenue: ${revenueError.message}`));
        } else if (salesError) {
          setError(salesError);
        } else if (revenueError) {
          setError(revenueError);
        } else {
          setError(null); // Clear previous errors if successful
        }
        
        console.log('ChartsSection: Data fetch attempt complete (Client)');

      } catch (err) { // Catch errors from Promise.all itself or other synchronous errors
        if (!isMounted) return;
        const caughtError = err instanceof Error ? err : new Error('Unknown error occurred during chart data loading');
        console.error("ChartsSection: General error in loadData (Client):", caughtError);
        setError(caughtError);
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('ChartsSection: Loading set to false (Client)');
        }
      }
    }

    loadData();

    return () => {
      isMounted = false; // Cleanup function to set flag when component unmounts
      console.log('ChartsSection: Component cleanup (Client)');
    };
  }, []); // Empty dependency array ensures this runs once on mount

  if (loading) {
    console.log('ChartsSection: Rendering loading skeleton (Client)');
    return <ChartsSkeleton />;
  }

  if (error && !sales && !categoryRevenue) { // If total failure to load any chart data
    console.log('ChartsSection: Rendering critical error state (Client):', error);
    return (
      <Alert variant="destructive" className="md:col-span-2">
        <AlertDescription>
          Error loading chart sections: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  // Render charts, potentially with individual error messages or skeletons
  // if one loaded and the other didn't, or if error is specific.
  // For simplicity, if there was an error captured, we show it,
  // otherwise, we try to render the charts.
  // A more granular approach for partial errors could be implemented here.

  console.log('ChartsSection: Preparing to render charts with data or partial errors (Client):', {
    salesDataPresent: !!sales,
    revenueDataPresent: !!categoryRevenue,
    errorState: error?.message
  });
  
  // If there's a general error, but some data might have loaded, we prioritize the error message.
  // Or, allow rendering charts that did load successfully.
  // This example prioritizes showing loaded charts if no general 'critical' error occurred.

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ErrorBoundary>
        {sales && sales.length > 0 ? (
          <div className="w-full">
            <SalesChart sales={sales} />
          </div>
        ) : error && sales === null ? ( // Only show specific error if sales data is null due to its own error
             <Alert variant="destructive"><AlertDescription>Failed to load sales chart: {error.message.includes("Sales:") || error.message.includes("sales data") ? error.message : "Network error"}</AlertDescription></Alert>
        ) : (
          <ChartSkeleton /> // Show skeleton if no sales data and no specific sales error
        )}
      </ErrorBoundary>
      <ErrorBoundary>
        {categoryRevenue && categoryRevenue.length > 0 ? (
          <div className="w-full">
            <RevenueByCategory categoryRevenueData={categoryRevenue} />
          </div>
        ) : error && categoryRevenue === null ? ( // Only show specific error if revenue data is null
            <Alert variant="destructive"><AlertDescription>Failed to load revenue chart: {error.message.includes("Revenue:") || error.message.includes("revenue data") ? error.message : "Network error"}</AlertDescription></Alert>
        ) : (
          <ChartSkeleton /> // Show skeleton if no revenue data and no specific revenue error
        )}
      </ErrorBoundary>
       {/* Display a general error if one occurred and wasn't specific to a chart that failed to load data */}
      {error && !(sales && categoryRevenue) && (sales === null || categoryRevenue === null) && (
         <div className="md:col-span-2">
            <Alert variant="destructive">
                <AlertDescription>There was a problem loading some chart data: {error.message}</AlertDescription>
            </Alert>
         </div>
      )}
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