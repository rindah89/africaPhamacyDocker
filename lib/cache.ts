// Simple in-memory cache with TTL (Time To Live)
interface CacheItem<T> {
  data: T;
  expiry: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

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
}

export const cache = new MemoryCache();

// Cache wrapper for database queries
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Check if cached data exists
  const cached = cache.get<T>(key);
  if (cached !== null) {
    console.log(`Cache hit for key: ${key}`);
    return cached;
  }

  // Execute function and cache result
  console.log(`Cache miss for key: ${key}`);
  const data = await fn();
  cache.set(key, data, ttl);
  return data;
}

// Specific cache keys generator
export const cacheKeys = {
  products: (page: number, limit: number) => `products:${page}:${limit}`,
  productCount: () => 'product:count',
  categories: () => 'categories:all',
  analytics: () => 'analytics:30days',
  revenueByCategory: () => 'revenue:category:6months',
  salesChart: () => 'sales:chart:7days',
  orders: (page: number, limit: number) => `orders:${page}:${limit}`,
  ordersMinimal: (page: number, limit: number) => `orders:minimal:${page}:${limit}`,
  orderCount: () => 'orders:count'
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
  analytics: () => {
    cache.delete(cacheKeys.analytics());
    cache.delete(cacheKeys.revenueByCategory());
    cache.delete(cacheKeys.salesChart());
  },
  all: () => cache.clear()
};

// Cleanup expired cache items every 10 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 10 * 60 * 1000);
} 