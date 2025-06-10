"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from "react";
import { getAllProducts } from "@/actions/products";
import { cacheProducts, getCachedProducts } from "@/lib/indexedDB";
import { useInterval } from "@/hooks/use-interval";
import { Toaster } from 'sonner';

function DataFetcher() {
  console.log('DataFetcher: Component mounted');

  const initializeCache = async () => {
    console.log('DataFetcher: Starting cache initialization');
    try {
      // First check if we have recent cached data to avoid blocking
      const { products: cachedProducts, needsRefresh } = await getCachedProducts();
      
      if (cachedProducts && !needsRefresh) {
        console.log('DataFetcher: Using recent cached data', {
          count: cachedProducts.length
        });
        return;
      }

      console.log('DataFetcher: Fetching products from server (background)');
      // Use pagination to avoid overwhelming queries
      const result = await getAllProducts(1, 100); // Limit to first 100 products for cache
      const products = result?.products;
      
      console.log('DataFetcher: Products fetched from server', { 
        count: products?.length,
        hasProducts: !!products,
        firstProduct: products?.[0]?.name
      });
      
      if (products && products.length > 0) {
        console.log('DataFetcher: Starting to cache products');
        await cacheProducts(products);
        console.log("DataFetcher: Products cached successfully", {
          count: products.length
        });
      }
    } catch (error) {
      console.error("DataFetcher: Error in cache initialization:", error);
      // Don't throw error to avoid breaking the dashboard
    }
  };

  // Initialize cache on mount - but don't await it to avoid blocking
  useEffect(() => {
    console.log('DataFetcher: Running initial cache effect (non-blocking)');
    // Use setTimeout to ensure this runs after initial render
    setTimeout(() => {
      initializeCache();
    }, 100);
  }, []);

  // Refresh cache every 30 minutes instead of 15 to reduce server load
  useInterval(() => {
    console.log('DataFetcher: Running refresh interval');
    initializeCache();
  }, 30 * 60 * 1000);

  console.log('DataFetcher: Rendering null');
  return null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('DashboardLayout: Starting render');

  useEffect(() => {
    console.log('DashboardLayout: Component mounted');
    return () => {
      console.log('DashboardLayout: Component unmounting');
    };
  }, []);

  console.log('DashboardLayout: Rendering content');
  return (
    <>
      <DataFetcher />
      {children}
      <Toaster richColors />
    </>
  );
} 