"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";

interface DashboardContextType {
  // Global dashboard state
  isRefreshing: boolean;
  setIsRefreshing: (refreshing: boolean) => void;
  
  // Global error handling
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showInfo: (message: string) => void;
  
  // Dashboard settings
  autoRefresh: boolean;
  setAutoRefresh: (enabled: boolean) => void;
  refreshInterval: number;
  setRefreshInterval: (interval: number) => void;
  
  // View preferences
  compactView: boolean;
  setCompactView: (compact: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  console.log('🔍 DashboardProvider - Component initialized');
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [compactView, setCompactView] = useState(false);

  // Log state changes
  useEffect(() => {
    console.log('🔍 DashboardProvider - State changed:', {
      isRefreshing,
      autoRefresh,
      refreshInterval,
      compactView,
      timestamp: new Date().toISOString()
    });
  }, [isRefreshing, autoRefresh, refreshInterval, compactView]);

  const showError = (message: string) => {
    console.log('🔍 DashboardProvider - Showing error:', message);
    toast.error(message, {
      duration: 5000,
      action: {
        label: "Dismiss",
        onClick: () => {},
      },
    });
  };

  const showSuccess = (message: string) => {
    console.log('🔍 DashboardProvider - Showing success:', message);
    toast.success(message, {
      duration: 3000,
    });
  };

  const showInfo = (message: string) => {
    console.log('🔍 DashboardProvider - Showing info:', message);
    toast.info(message, {
      duration: 4000,
    });
  };

  // Enhanced setIsRefreshing with logging
  const setIsRefreshingWithLogging = (refreshing: boolean) => {
    console.log('🔍 DashboardProvider - Setting isRefreshing:', {
      from: isRefreshing,
      to: refreshing,
      timestamp: new Date().toISOString()
    });
    setIsRefreshing(refreshing);
  };

  // Enhanced setAutoRefresh with logging
  const setAutoRefreshWithLogging = (enabled: boolean) => {
    console.log('🔍 DashboardProvider - Setting autoRefresh:', {
      from: autoRefresh,
      to: enabled,
      timestamp: new Date().toISOString()
    });
    setAutoRefresh(enabled);
  };

  // Enhanced setRefreshInterval with logging
  const setRefreshIntervalWithLogging = (interval: number) => {
    console.log('🔍 DashboardProvider - Setting refreshInterval:', {
      from: refreshInterval,
      to: interval,
      timestamp: new Date().toISOString()
    });
    setRefreshInterval(interval);
  };

  // Enhanced setCompactView with logging
  const setCompactViewWithLogging = (compact: boolean) => {
    console.log('🔍 DashboardProvider - Setting compactView:', {
      from: compactView,
      to: compact,
      timestamp: new Date().toISOString()
    });
    setCompactView(compact);
  };

  const value: DashboardContextType = {
    isRefreshing,
    setIsRefreshing: setIsRefreshingWithLogging,
    showError,
    showSuccess,
    showInfo,
    autoRefresh,
    setAutoRefresh: setAutoRefreshWithLogging,
    refreshInterval,
    setRefreshInterval: setRefreshIntervalWithLogging,
    compactView,
    setCompactView: setCompactViewWithLogging,
  };

  console.log('🔍 DashboardProvider - Providing context value:', {
    isRefreshing,
    autoRefresh,
    refreshInterval,
    compactView
  });

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  console.log('🔍 useDashboard - Hook called');
  const context = useContext(DashboardContext);
  if (context === undefined) {
    console.error('🔍 useDashboard - Error: must be used within a DashboardProvider');
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  
  console.log('🔍 useDashboard - Returning context:', {
    isRefreshing: context.isRefreshing,
    autoRefresh: context.autoRefresh,
    refreshInterval: context.refreshInterval,
    compactView: context.compactView
  });
  
  return context;
} 