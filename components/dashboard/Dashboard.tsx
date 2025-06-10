"use client";

import { Suspense } from "react";
import { AnalyticsSection, AnalyticsSkeleton } from "./Analytics/AnalyticsSection";
import { ChartsSection, ChartsSkeleton } from "./Analytics/ChartsSection";
import { SummarySkeleton } from "./Analytics/DashboardSummary";
import { ErrorBoundary } from "./ErrorBoundary";
import DashboardSummary from "./Analytics/DashboardSummary";

export function Dashboard() {
  // Render immediately - all data loading happens in child components via API routes
  return (
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
  );
}
