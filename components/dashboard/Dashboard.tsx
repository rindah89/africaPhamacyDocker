"use client";

import { Button } from "@/components/ui/button";
import AnalyticsCard from "./Analytics/AnalyticsCard";
import TransactionsList from "./TransactionsList";
import {
  AnalyticsProps,
  getAnalytics,
  getRevenueByMainCategory,
  getRevenueByMainCategoryPastSixMonths,
  getSalesCountByMainCategory,
  getSalesCountForPastSevenDays,
} from "@/actions/analytics";
import DashboardSummary from "./Analytics/DashboardSummary";
import { SalesChart } from "./Analytics/SalesChart";
import { RevenueByCategory } from "./Analytics/RevenueByCategory";
import { Suspense } from "react";
import { AnalyticsSection, AnalyticsSkeleton } from "./Analytics/AnalyticsSection";
import { ChartsSection, ChartsSkeleton } from "./Analytics/ChartsSection";
import { SummarySkeleton } from "./Analytics/SummarySkeleton";
import { ErrorBoundary } from "./ErrorBoundary";

export function Dashboard() {
  // Render immediately - all data loading happens in child components
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
