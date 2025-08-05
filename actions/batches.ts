"use server";

import { cache, withCache } from "@/lib/cache";
import prisma from "@/lib/db";

export interface ProductBatch {
  id: string;
  batchNumber: string;
  quantity: number;
  expiryDate: Date;
  deliveryDate?: Date | null;
  costPerUnit: number;
  notes?: string | null;
  status: boolean;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
  product: {
    name: string;
    productCode: string;
  };
}

// Extended cache keys for batches
const batchCacheKeys = {
  allBatches: () => 'batches:all',
  batchesPaginated: (page: number, limit: number) => `batches:${page}:${limit}`,
  batchesCount: () => 'batches:count',
  expiredBatches: () => 'batches:expired',
  expiringBatches: (days: number) => `batches:expiring:${days}`,
};

export async function getAllBatches(): Promise<ProductBatch[]> {
  try {
    return await withCache(
      batchCacheKeys.allBatches(),
      async () => {
        const batches = await prisma.productBatch.findMany({
          include: {
            product: {
              select: {
                name: true,
                productCode: true
              }
            }
          },
          orderBy: {
            expiryDate: 'asc'
          }
        });

        return batches as ProductBatch[];
      },
      5 * 60 * 1000 // 5 minutes cache
    );
  } catch (error) {
    console.error("Error fetching all batches:", error);
    throw new Error("Failed to fetch batches");
  }
}

export async function getBatchesPaginated(
  page: number = 1, 
  limit: number = 50
): Promise<{ batches: ProductBatch[]; total: number; hasMore: boolean }> {
  try {
    const cacheKey = batchCacheKeys.batchesPaginated(page, limit);
    
    return await withCache(
      cacheKey,
      async () => {
        const skip = (page - 1) * limit;
        
        const [batches, total] = await Promise.all([
          prisma.productBatch.findMany({
            include: {
              product: {
                select: {
                  name: true,
                  productCode: true
                }
              }
            },
            orderBy: {
              expiryDate: 'asc'
            },
            skip,
            take: limit
          }),
          prisma.productBatch.count()
        ]);

        const validBatches = batches as ProductBatch[];
        const hasMore = skip + validBatches.length < total;

        return {
          batches: validBatches,
          total,
          hasMore
        };
      },
      3 * 60 * 1000 // 3 minutes cache for paginated data
    );
  } catch (error) {
    console.error("Error fetching paginated batches:", error);
    throw new Error("Failed to fetch batches");
  }
}

export async function getExpiringBatches(days: number = 30): Promise<ProductBatch[]> {
  try {
    return await withCache(
      batchCacheKeys.expiringBatches(days),
      async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        const batches = await prisma.productBatch.findMany({
          where: {
            expiryDate: {
              lte: futureDate
            },
            status: true,
          },
          include: {
            product: {
              select: {
                name: true,
                productCode: true
              }
            }
          },
          orderBy: {
            expiryDate: 'asc'
          }
        });

        return batches as ProductBatch[];
      },
      2 * 60 * 1000 // 2 minutes cache for critical data
    );
  } catch (error) {
    console.error("Error fetching expiring batches:", error);
    throw new Error("Failed to fetch expiring batches");
  }
}

export async function fixOrphanedBatches(): Promise<{ fixed: number; message: string }> {
  try {
    // Find batches where the referenced product doesn't exist
    const allBatches = await prisma.productBatch.findMany({
      select: {
        id: true,
        productId: true
      }
    });

    const allProducts = await prisma.product.findMany({
      select: {
        id: true
      }
    });

    const productIds = new Set(allProducts.map(p => p.id));
    const orphanedBatchIds = allBatches
      .filter(batch => !productIds.has(batch.productId))
      .map(batch => batch.id);

    if (orphanedBatchIds.length === 0) {
      return {
        fixed: 0,
        message: "No orphaned batches found"
      };
    }

    // Soft delete orphaned batches by setting status to false
    const result = await prisma.productBatch.updateMany({
      where: {
        id: {
          in: orphanedBatchIds
        }
      },
      data: {
        status: false
      }
    });

    // Invalidate cache after fixing batches
    await invalidateBatchesCache();

    return {
      fixed: result.count,
      message: `Fixed ${result.count} orphaned batches`
    };
    
  } catch (error) {
    console.error("Error fixing orphaned batches:", error);
    throw new Error("Failed to fix orphaned batches");
  }
}

// Cache invalidation helpers for batches
export const invalidateBatchesCache = async () => {
  const keys = Array.from((cache as any).cache.keys()) as string[];
  keys.forEach((key: string) => {
    if (key.startsWith('batches:')) {
      cache.delete(key);
    }
  });
};

export const refreshBatchesData = async () => {
  await invalidateBatchesCache();
  // Pre-warm cache with fresh data
  await getAllBatches();
}; 