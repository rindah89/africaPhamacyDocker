/**
 * Smart Cache System
 * Implements intelligent caching with memory storage and smart expiration
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expires: number;
  accessCount: number;
  lastAccessed: number;
}

class SmartCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 1000; // Maximum cache entries
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    // Update access stats
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    return entry.data as T;
  }

  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    const now = Date.now();
    const expires = now + (ttl || this.defaultTTL);

    // Evict old entries if at max size
    if (this.cache.size >= this.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expires,
      accessCount: 0,
      lastAccessed: now
    });
  }

  async invalidate(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`Invalidated ${keysToDelete.length} cache entries matching pattern: ${pattern}`);
  }

  private evictLeastRecentlyUsed(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // Get cache stats
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    for (const entry of this.cache.values()) {
      if (now > entry.expires) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.cache.size,
      active,
      expired,
      maxSize: this.maxSize
    };
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`Cleaned up ${keysToDelete.length} expired cache entries`);
  }
}

// Global cache instance
const smartCache = new SmartCache();

// Cache wrapper with smart strategies
export async function withSmartCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    staleWhileRevalidate?: boolean;
    tags?: string[];
  } = {}
): Promise<T> {
  const { ttl = 5 * 60 * 1000, staleWhileRevalidate = false, tags = [] } = options;

  // Try to get from cache first
  const cached = await smartCache.get<T>(key);
  
  if (cached !== null) {
    console.log(`Cache HIT for key: ${key}`);
    return cached;
  }

  console.log(`Cache MISS for key: ${key}, fetching...`);

  try {
    // Fetch fresh data
    const data = await fetcher();
    
    // Store in cache
    await smartCache.set(key, data, ttl);
    
    return data;
  } catch (error) {
    console.error(`Error fetching data for key ${key}:`, error);
    throw error;
  }
}

// Cache invalidation helpers
export const cacheInvalidation = {
  // Invalidate all analytics data
  analytics: () => smartCache.invalidate('analytics*'),
  
  // Invalidate all sales data
  sales: () => smartCache.invalidate('sales*'),
  
  // Invalidate all product data
  products: () => smartCache.invalidate('products*'),
  
  // Invalidate everything
  all: () => smartCache.invalidate('*'),
  
  // Clean expired entries
  cleanup: () => smartCache.cleanup(),
  
  // Get cache statistics
  stats: () => smartCache.getStats()
};

// Smart cache keys with hierarchical structure
export const smartCacheKeys = {
  analytics: {
    overview: () => 'analytics:overview',
    sales7days: () => 'analytics:sales:7days',
    revenue6months: () => 'analytics:revenue:6months',
    products: (limit: number) => `analytics:products:${limit}`
  },
  
  sales: {
    report: (from: string, to: string) => `sales:report:${from}:${to}`,
    daily: (date: string) => `sales:daily:${date}`,
    summary: (period: string) => `sales:summary:${period}`
  },
  
  products: {
    bestSelling: (limit: number) => `products:bestselling:${limit}`,
    byCategory: (categoryId: string) => `products:category:${categoryId}`,
    search: (query: string) => `products:search:${query}`
  }
};

// Auto cleanup every 30 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    cacheInvalidation.cleanup();
  }, 30 * 60 * 1000);
}

export default smartCache; 