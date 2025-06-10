"use client";

import { useState, useEffect } from "react";
import { getAnalytics, getSalesCountForPastSevenDays, getRevenueByMainCategoryPastSixMonths, AnalyticsProps, DailySales, MonthlyMainCategoryRevenue } from "@/actions/analytics";
import { getBestSellingProducts } from "@/actions/products";
import { getRecentOrdersForDashboard } from "@/actions/pos";
import { getRecentCustomersForDashboard } from "@/actions/orders";

// Hook for analytics data
export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsProps[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const data = await getAnalytics();
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
        const [sales, revenue] = await Promise.all([
          getSalesCountForPastSevenDays().catch(err => {
            console.error('Failed to fetch sales data:', err);
            return null;
          }),
          getRevenueByMainCategoryPastSixMonths().catch(err => {
            console.error('Failed to fetch revenue data:', err);
            return null;
          })
        ]);

        setSalesData(sales);
        setCategoryRevenue(revenue);

        // Set error only if both failed
        if (!sales && !revenue) {
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
        const [orders, products, customers] = await Promise.all([
          getRecentOrdersForDashboard(5).catch(e => {
            console.error("Failed to fetch recent orders:", e);
            return { error: true, message: e.message || "Error fetching orders" };
          }),
          getBestSellingProducts(5).catch(e => {
            console.error("Failed to fetch best selling products:", e);
            return { error: true, message: e.message || "Error fetching products" };
          }),
          getRecentCustomersForDashboard(5).catch(e => {
            console.error("Failed to fetch recent customers:", e);
            return { error: true, message: e.message || "Error fetching customers" };
          })
        ]);

        setOrdersData(orders);
        setBestSellingProducts(Array.isArray(products) ? products : []);
        setCustomersData(customers);
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