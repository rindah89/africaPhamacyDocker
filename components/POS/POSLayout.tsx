"use client";

import React, { useEffect, useState } from "react";
import { getAllProducts } from "@/actions/products";
import { getAllCategories } from "@/actions/category";
import { getAllCustomers } from "@/actions/customer";
import { getCachedProducts, cacheProducts } from "@/lib/indexedDB";
import { useInterval } from "@/hooks/use-interval";
import { Loader2 } from "lucide-react";
import PointOfSale from "@/components/POS/PointOfSale";
import type { Product, Category } from "@prisma/client";
import type { ICustomer } from "@/types/types";
import { Button } from "@/components/ui/button";
import ShiftManager from "@/components/POS/ShiftManager";

interface Customer {
  label: string;
  value: string;
  email: string;
}

interface POSLayoutProps {
  currentShift: any;
}

export default function POSLayout({ currentShift }: POSLayoutProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    products: Product[];
    categories: Category[];
    customers: Customer[];
  }>({
    products: [],
    categories: [],
    customers: []
  });

  const loadPOSData = async () => {
    try {
      // Try to get cached products first
      const { products: cachedProducts, needsRefresh } = await getCachedProducts();
      
      let products: Product[] = [];
      if (cachedProducts && !needsRefresh) {
        products = cachedProducts;
      } else {
        // If no cache or needs refresh, fetch from server
        try {
          const freshProducts = await getAllProducts();
          
          if (freshProducts && Array.isArray(freshProducts)) {
            products = freshProducts;
            // Update cache with fresh data
            await cacheProducts(freshProducts);
          } else {
            throw new Error("Invalid products data from server");
          }
        } catch (fetchError) {
          throw fetchError;
        }
      }

      // Always fetch categories and customers as they're typically smaller datasets
      const [categoriesData, customersData] = await Promise.all([
        getAllCategories(),
        getAllCustomers()
      ]) as [Category[] | null, ICustomer[] | null];

      setData({
        products,
        categories: categoriesData || [],
        customers: (customersData || []).map(c => ({
          label: c.user.name,
          value: c.id,
          email: c.user.email
        }))
      });
    } catch (error) {
      setError("Failed to load POS data: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadPOSData();
  }, []);

  // Refresh data every 15 minutes
  useInterval(() => {
    loadPOSData();
  }, 15 * 60 * 1000);

  if (!currentShift) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Active Shift</h2>
          <p className="text-muted-foreground">
            Please start a shift to use the POS system
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading POS data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading POS Data</h2>
          <p className="text-muted-foreground">
            {error}. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ShiftManager currentShift={currentShift} className="border-b" />
      <div className="flex-1">
        <PointOfSale
          categories={data.categories}
          products={data.products}
          customers={data.customers}
          selectedCatId="all"
          currentShift={currentShift}
        />
      </div>
    </div>
  );
} 