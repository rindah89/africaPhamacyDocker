"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import dynamic from 'next/dynamic';
import { ErrorBoundary } from "../ErrorBoundary";
import { useChartsData } from "@/hooks/use-dashboard-data";

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
  
  const { salesData, categoryRevenue, loading, error } = useChartsData();

  if (loading) {
    console.log('ChartsSection: Rendering loading skeleton (Client)');
    return <ChartsSkeleton />;
  }

  if (error && !salesData && !categoryRevenue) {
    console.log('ChartsSection: Rendering error state (Client):', error);
    return (
      <Alert variant="destructive" className="md:col-span-2">
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  console.log('ChartsSection: Rendering charts (Client)', {
    salesDataPresent: !!salesData,
    revenueDataPresent: !!categoryRevenue
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ErrorBoundary>
        {salesData && salesData.length > 0 ? (
          <div className="w-full">
            <SalesChart sales={salesData} />
          </div>
        ) : (
          <Alert variant="destructive">
            <AlertDescription>Failed to load sales chart data.</AlertDescription>
          </Alert>
        )}
      </ErrorBoundary>
      <ErrorBoundary>
        {categoryRevenue && categoryRevenue.length > 0 ? (
          <div className="w-full">
            <RevenueByCategory categoryRevenueData={categoryRevenue} />
          </div>
        ) : (
          <Alert variant="destructive">
            <AlertDescription>Failed to load revenue chart data.</AlertDescription>
          </Alert>
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