"use client";

import { RefreshCw, Settings, TrendingUp } from "lucide-react";
import AnalyticsCard from "./AnalyticsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAnalytics, useDashboardMutations } from "@/hooks/use-dashboard-data";
import { useDashboard } from "../DashboardProvider";
import { useEffect } from "react";

export function AnalyticsSection() {
  const { analytics, loading, error, isRefetching, refetch } = useAnalytics();
  const { refreshAllData } = useDashboardMutations();
  const { isRefreshing, setIsRefreshing, compactView } = useDashboard();

  // Add comprehensive logging
  useEffect(() => {
    console.log('🔍 AnalyticsSection - Component mounted');
    console.log('🔍 AnalyticsSection - Initial state:', {
      analytics: analytics,
      analyticsLength: analytics?.length,
      analyticsType: typeof analytics,
      loading,
      error,
      isRefetching,
      isRefreshing,
      compactView
    });
  }, []);

  useEffect(() => {
    console.log('🔍 AnalyticsSection - Data changed:', {
      analytics: analytics,
      analyticsLength: analytics?.length,
      analyticsIsArray: Array.isArray(analytics),
      analyticsData: analytics ? JSON.stringify(analytics, null, 2) : 'null',
      loading,
      error,
      timestamp: new Date().toISOString()
    });
  }, [analytics, loading, error]);

  const handleRefresh = async () => {
    console.log('🔄 AnalyticsSection - Manual refresh triggered');
    setIsRefreshing(true);
    try {
      const result = await refetch();
      console.log('🔄 AnalyticsSection - Manual refresh result:', {
        success: !!result.data,
        data: result.data,
        error: result.error
      });
    } catch (refreshError) {
      console.error('🔄 AnalyticsSection - Manual refresh failed:', refreshError);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshAll = async () => {
    console.log('🔄 AnalyticsSection - Refresh all triggered');
    setIsRefreshing(true);
    try {
      const result = await refreshAllData.mutateAsync();
      console.log('🔄 AnalyticsSection - Refresh all result:', result);
    } catch (refreshError) {
      console.error('🔄 AnalyticsSection - Refresh all failed:', refreshError);
    } finally {
      setIsRefreshing(false);
    }
  };

  console.log('🔍 AnalyticsSection - Render decision:', {
    loading,
    error: !!error,
    analytics: !!analytics,
    analyticsLength: analytics?.length,
    willShowLoading: loading,
    willShowError: error || !analytics,
    willShowData: !loading && !error && analytics
  });

  if (loading) {
    console.log('🔍 AnalyticsSection - Showing loading skeleton');
    return <AnalyticsSkeleton />;
  }

  if (error || !analytics) {
    console.log('🔍 AnalyticsSection - Showing error state:', {
      error,
      analytics,
      analyticsExists: !!analytics
    });
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Analytics Overview</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            {error || "Failed to load analytics data"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  console.log('🔍 AnalyticsSection - Showing data state:', {
    analyticsLength: analytics.length,
    analyticsData: analytics.map((item, i) => ({ index: i, title: item.title, count: item.count }))
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium">Analytics Overview</h2>
          {isRefetching && (
            <Badge variant="secondary" className="animate-pulse">
              <TrendingUp className="h-3 w-3 mr-1" />
              Updating...
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(isRefreshing || isRefetching) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={isRefreshing || refreshAllData.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(isRefreshing || refreshAllData.isPending) ? 'animate-spin' : ''}`} />
            Refresh All
          </Button>
        </div>
      </div>
      
      <div className={`grid gap-4 md:gap-8 ${
        compactView 
          ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6' 
          : 'md:grid-cols-2 lg:grid-cols-4'
      }`}>
        {analytics && Array.isArray(analytics) && analytics.map((item, i) => {
          console.log(`🔍 AnalyticsSection - Rendering card ${i}:`, {
            title: item.title,
            count: item.count,
            countUnit: item.countUnit,
            detailLink: item.detailLink,
            iconName: item.iconName,
            iconType: typeof item.iconName
          });
          
          try {
            return (
              <AnalyticsCard 
                key={`${item.title}-${i}`} 
                item={item} 
                compact={compactView}
                isRefreshing={isRefetching}
              />
            );
          } catch (renderError) {
            console.error(`🔍 AnalyticsSection - Error rendering card ${i}:`, renderError);
            return (
              <div key={`error-${i}`} className="p-4 border border-red-200 rounded">
                <p className="text-red-600 text-sm">Error rendering card: {item.title}</p>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}

export function AnalyticsSkeleton() {
  console.log('🔍 AnalyticsSkeleton - Rendering loading skeleton');
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-[200px]" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-[80px]" />
          <Skeleton className="h-8 w-[100px]" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[140px]" />
              <Skeleton className="h-4 w-4" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-[100px]" />
              <Skeleton className="h-3 w-[120px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 