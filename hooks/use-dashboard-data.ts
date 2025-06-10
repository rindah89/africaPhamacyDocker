"use client";

import { useState, useEffect } from "react";

export interface AnalyticsProps {
  title: string;
  count: number;
  detailLink: string;
  countUnit?: "" | undefined;
  icon: any;
}

export interface DailySales {
  day: string;
  sales: number;
}

export interface MonthlyMainCategoryRevenue {
  month: string;
  [category: string]: number | string;
}

// Hook for analytics data
export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsProps[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await fetch('/api/dashboard/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const data = await response.json();
        if (data) {
          setAnalytics(data);
        } else {
          setError("Failed to load analytics data");
        }
      } catch (err) {
        console.error("Analytics loading error:", err);
        setError("Error loading analytics");
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  return { analytics, loading, error };
}

// Hook for charts data
export function useChartsData() {
  const [salesData, setSalesData] = useState<DailySales[] | null>(null);
  const [categoryRevenue, setCategoryRevenue] = useState<MonthlyMainCategoryRevenue[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadChartsData() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch('/api/dashboard/charts', {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch charts data`);
        }
        
        const data = await response.json();
        
        // Provide fallback empty data if API data is null
        setSalesData(data.salesData || []);
        setCategoryRevenue(data.categoryRevenue || []);

        // Only set error if API explicitly failed
        if (!data.success && data.error) {
          setError(`Warning: ${data.error}`);
        }
      } catch (err) {
        console.error("Charts data loading error:", err);
        
        // Set fallback empty data instead of null
        setSalesData([]);
        setCategoryRevenue([]);
        
        if (err instanceof Error && err.name === 'AbortError') {
          setError("Charts timed out. Using offline mode.");
        } else {
          setError("Failed to load charts. Using offline mode.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadChartsData();
  }, []);

  return { salesData, categoryRevenue, loading, error };
}

// Hook for dashboard summary data
export function useDashboardSummary() {
  const [ordersData, setOrdersData] = useState<any>(null);
  const [bestSellingProducts, setBestSellingProducts] = useState<any[] | null>(null);
  const [customersData, setCustomersData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSummaryData() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch('/api/dashboard/summary', {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch summary data`);
        }

        const data = await response.json();

        // Handle partial failures gracefully
        setOrdersData(data.ordersData || []);
        setBestSellingProducts(data.bestSellingProducts || []);
        setCustomersData(data.customersData || []);

        // Only set error if API returned error flag
        if (!data.success && data.error) {
          setError(`Warning: ${data.error}`);
        }
      } catch (err) {
        console.error('Error loading dashboard summary:', err);
        
        // Set fallback data instead of just showing error
        setOrdersData([]);
        setBestSellingProducts([]);
        setCustomersData([]);
        
        if (err instanceof Error && err.name === 'AbortError') {
          setError('Request timed out. Using offline mode.');
        } else {
          setError('Failed to load dashboard data. Using offline mode.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadSummaryData();
  }, []);

  return { ordersData, bestSellingProducts, customersData, loading, error };
} 