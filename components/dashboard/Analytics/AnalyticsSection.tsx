"use client";

import AnalyticsCard from "./AnalyticsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAnalytics } from "@/hooks/use-dashboard-data";

export function AnalyticsSection() {
  const { analytics, loading, error } = useAnalytics();

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (error || !analytics) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error || "Failed to load analytics data"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      {analytics.map((item, i) => (
        <AnalyticsCard key={i} item={item} />
      ))}
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <Skeleton className="h-8 w-[200px] mb-4" />
          <Skeleton className="h-6 w-[100px]" />
        </div>
      ))}
    </div>
  );
} 