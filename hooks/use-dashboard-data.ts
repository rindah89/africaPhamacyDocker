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
        const response = await fetch('/api/dashboard/charts');
        if (!response.ok) {
          throw new Error('Failed to fetch charts data');
        }
        const data = await response.json();
        
        setSalesData(data.salesData);
        setCategoryRevenue(data.categoryRevenue);

        // Set error only if both failed
        if (!data.salesData && !data.categoryRevenue) {
          setError("Failed to load chart data");
        }
      } catch (err) {
        console.error("Charts data loading error:", err);
        setError("Error loading charts");
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
        const response = await fetch('/api/dashboard/summary');
        if (!response.ok) {
          throw new Error('Failed to fetch summary data');
        }
        const data = await response.json();

        setOrdersData(data.ordersData);
        setBestSellingProducts(data.bestSellingProducts);
        setCustomersData(data.customersData);
      } catch (err) {
        console.error('Error loading dashboard summary:', err);
        setError('Failed to load dashboard summary');
      } finally {
        setLoading(false);
      }
    }

    loadSummaryData();
  }, []);

  return { ordersData, bestSellingProducts, customersData, loading, error };
} 