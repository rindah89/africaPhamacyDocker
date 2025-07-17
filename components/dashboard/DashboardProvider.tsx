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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [compactView, setCompactView] = useState(false);

  const showError = (message: string) => {
    toast.error(message, {
      duration: 5000,
      action: {
        label: "Dismiss",
        onClick: () => {},
      },
    });
  };

  const showSuccess = (message: string) => {
    toast.success(message, {
      duration: 3000,
    });
  };

  const showInfo = (message: string) => {
    toast.info(message, {
      duration: 4000,
    });
  };

  const value: DashboardContextType = {
    isRefreshing,
    setIsRefreshing,
    showError,
    showSuccess,
    showInfo,
    autoRefresh,
    setAutoRefresh,
    refreshInterval,
    setRefreshInterval,
    compactView,
    setCompactView,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  
  return context;
} 