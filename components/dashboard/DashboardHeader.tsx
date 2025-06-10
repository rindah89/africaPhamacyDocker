"use client";

import { useState } from "react";
import { RefreshCw, TrendingUp, Clock, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardSettings } from "./DashboardSettings";
import { useDashboard } from "./DashboardProvider";
import { useDashboardMutations } from "@/hooks/use-dashboard-data";

export function DashboardHeader() {
  const { 
    isRefreshing, 
    setIsRefreshing, 
    autoRefresh, 
    refreshInterval 
  } = useDashboard();
  
  const { refreshAllData } = useDashboardMutations();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAllData.mutateAsync();
      setLastRefresh(new Date());
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ago`;
    }
    return `${seconds}s ago`;
  };

  return (
    <div className="flex items-center justify-between p-4 bg-background border-b">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Last updated: {formatTimeAgo(lastRefresh)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {autoRefresh ? (
            <Badge variant="secondary" className="gap-1">
              <Wifi className="h-3 w-3" />
              Live
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              <WifiOff className="h-3 w-3" />
              Manual
            </Badge>
          )}
          
          {isRefreshing && (
            <Badge variant="secondary" className="animate-pulse gap-1">
              <TrendingUp className="h-3 w-3" />
              Updating...
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-xs text-muted-foreground">
          {autoRefresh && (
            <span>Auto-refresh: {refreshInterval / 1000}s</span>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
        
        <DashboardSettings />
      </div>
    </div>
  );
} 