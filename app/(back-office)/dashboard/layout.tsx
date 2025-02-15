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
      console.log('DataFetcher: Fetching products from server');
      const products = await getAllProducts();
      console.log('DataFetcher: Products fetched from server', { 
        count: products?.length,
        hasProducts: !!products,
        firstProduct: products?.[0]?.name
      });
      
      if (products) {
        console.log('DataFetcher: Starting to cache products');
        await cacheProducts(products);
        console.log("DataFetcher: Products cached successfully", {
          count: products.length
        });

        // Verify cache
        const { products: verifyCache } = await getCachedProducts();
        console.log("DataFetcher: Verifying cache", {
          cacheExists: !!verifyCache,
          cachedCount: verifyCache?.length
        });
      }
    } catch (error) {
      console.error("DataFetcher: Error in cache initialization:", error);
    }
  };

  // Initialize cache on mount
  useEffect(() => {
    console.log('DataFetcher: Running initial cache effect');
    initializeCache();
  }, []);

  // Refresh cache every 15 minutes
  useInterval(() => {
    console.log('DataFetcher: Running refresh interval');
    initializeCache();
  }, 15 * 60 * 1000);

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