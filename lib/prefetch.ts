import { getProductsByCategoryId, getProductsBySearchQuery } from "@/actions/products";
import { cache } from "react";

// Create a cached version of the product fetching
export const getPrefetchedProducts = cache(async () => {
  const products = await getProductsByCategoryId("all", 1, 50);
  return {
    products,
    timestamp: Date.now()
  };
});

// Cache for search results with a Map to store recent searches
const searchCache = new Map<string, { results: any[], timestamp: number }>();
const SEARCH_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cached search function
export const getCachedSearchResults = cache(async (query: string) => {
  // Check if we have a recent cache for this query
  const cached = searchCache.get(query);
  const now = Date.now();

  if (cached && (now - cached.timestamp) < SEARCH_CACHE_DURATION) {
    return cached.results;
  }

  // If no cache or expired, perform the search
  const results = await getProductsBySearchQuery(query);
  
  // Cache the results
  searchCache.set(query, {
    results,
    timestamp: now
  });

  // Clean up old cache entries
  for (const [key, value] of searchCache.entries()) {
    if (now - value.timestamp > SEARCH_CACHE_DURATION) {
      searchCache.delete(key);
    }
  }

  return results;
});

// Function to trigger prefetch
export async function prefetchProducts() {
  try {
    await getPrefetchedProducts();
  } catch (error) {
    console.error("Error prefetching products:", error);
  }
}

// Function to clear search cache for a specific query
export function clearSearchCache(query?: string) {
  if (query) {
    searchCache.delete(query);
  } else {
    searchCache.clear();
  }
} 