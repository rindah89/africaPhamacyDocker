// Simple in-memory cache with TTL (Time To Live)
interface CacheItem<T> {
  data: T;
  expiry: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 10 * 60 * 1000; // 10 minutes default (increased from 5)

  set<T>(key: string, data: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data, expiry });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache stats for monitoring
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const cache = new MemoryCache();

// Cache wrapper for database queries with fallback handling
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number,
  fallback?: T
): Promise<T> {
  // Check if cached data exists
  const cached = cache.get<T>(key);
  
  if (cached !== null) {
    console.log(`Cache hit for key: ${key}`);
    return cached;
  }

  console.log(`Cache miss for key: ${key}`);
  // Execute function and cache result
  try {
    const data = await fn();
    cache.set(key, data, ttl);
    return data;
  } catch (error) {
    console.error(`Cache error for key ${key}:`, error);
    
    // Return fallback data if provided
    if (fallback !== undefined) {
      console.log(`Using fallback data for key: ${key}`);
      return fallback;
    }
    
    // If no fallback, try to return stale cache data
    const staleData = (cache as any).cache.get(key);
    if (staleData) {
      console.log(`Using stale cache data for key: ${key}`);
      return staleData.data;
    }
    
    throw error;
  }
}

// Specific cache keys generator
export const cacheKeys = {
  products: (page: number, limit: number) => `products:${page}:${limit}`,
  productCount: () => 'product:count',
  categories: () => 'categories:all',
  analytics: () => 'analytics:30days',
  revenueByCategory: () => 'revenue:category:6months',
  salesCountPastSevenDays: () => `sales:count:7days`,
  orders: (page: number, limit: number) => `orders:${page}:${limit}`,
  ordersMinimal: (page: number, limit: number) => `orders:minimal:${page}:${limit}`,
  orderCount: () => 'orders:count',
  sales: (page: number, limit: number, startDate?: string, endDate?: string) => 
    `sales:${page}:${limit}:${startDate || 'all'}:${endDate || 'all'}`,
  salesMinimal: (page: number, limit: number) => `sales:minimal:${page}:${limit}`,
  salesCount: () => 'sales:count',

  // New keys for dashboard summaries
  recentOrdersDashboard: (count: number) => `orders:dashboard:${count}`,
  bestSellingProducts: (count: number) => `products:bestselling:${count}`,
  recentCustomersDashboard: (count: number) => `customers:dashboard:${count}`
};

// Cache invalidation helpers
export const invalidateCache = {
  products: () => {
    // Clear all product-related cache
    const keys = Array.from((cache as any).cache.keys());
    keys.forEach(key => {
      if (key.startsWith('products:') || key.startsWith('product:')) {
        cache.delete(key);
      }
    });
  },
  orders: () => {
    // Clear all order-related cache
    const keys = Array.from((cache as any).cache.keys());
    keys.forEach(key => {
      if (key.startsWith('orders:') || key.startsWith('order:')) {
        cache.delete(key);
      }
    });
  },
  sales: () => {
    // Clear all sales-related cache
    const keys = Array.from((cache as any).cache.keys());
    keys.forEach(key => {
      if (key.startsWith('sales:')) {
        cache.delete(key);
      }
    });
  },
  analytics: () => {
    cache.delete(cacheKeys.analytics());
    cache.delete(cacheKeys.revenueByCategory());
    cache.delete(cacheKeys.salesCountPastSevenDays());
  },
  all: () => cache.clear()
};

// Cleanup expired cache items every 5 minutes (reduced from 10)
if (typeof window === 'undefined') {
  setInterval(() => {
    cache.cleanup();
    console.log('Cache cleanup completed:', cache.getStats());
  }, 5 * 60 * 1000);
} 