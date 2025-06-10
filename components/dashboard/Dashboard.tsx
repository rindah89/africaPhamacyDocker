"use client";

import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AnalyticsSection, AnalyticsSkeleton } from "./Analytics/AnalyticsSection";
import { ChartsSection, ChartsSkeleton } from "./Analytics/ChartsSection";
import { SummarySkeleton } from "./Analytics/DashboardSummary";
import { ErrorBoundary } from "./ErrorBoundary";
import DashboardSummary from "./Analytics/DashboardSummary";
import { DashboardProvider } from "./DashboardProvider";
import { DashboardHeader } from "./DashboardHeader";
import { Toaster } from "sonner";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    },
    mutations: {
      retry: 1,
    },
  },
});

function DashboardContent() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <ErrorBoundary>
          <Suspense fallback={<AnalyticsSkeleton />}>
            <AnalyticsSection />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<ChartsSkeleton />}>
            <ChartsSection />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<SummarySkeleton />}>
            <DashboardSummary />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export function Dashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardProvider>
        <DashboardContent />
        <Toaster richColors position="top-right" />
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </DashboardProvider>
    </QueryClientProvider>
  );
}
