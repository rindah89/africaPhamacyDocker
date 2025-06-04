"use server";

import prisma from "@/lib/db";
import { withCache, cacheKeys } from "@/lib/cache";
import { ILineOrder } from "@/types/types";

// Simple fallback sales fetching for when the main function has issues
export async function getAllSalesSimple(page = 1, limit = 50) {
  try {
    const skip = (page - 1) * limit;
    
    const where = undefined;

    const sales = await prisma.sale.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        qty: true,
        salePrice: true,
        total: true,
        productName: true,
        productImage: true,
        customerName: true,
        customerEmail: true,
        paymentMethod: true,
        createdAt: true,
        updatedAt: true,
        orderId: true,
        productId: true,
        orderNumber: true,
        // Insurance fields
        insuranceClaimId: true,
        insuranceAmount: true,
        customerPaidAmount: true,
        insurancePercentage: true,
      }
    });

    const totalCount = await prisma.sale.count({ where });
    
    return {
      sales,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    };
  } catch (error) {
    console.error("Error fetching sales (simple):", error);
    return {
      sales: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page
    };
  }
}

// Optimized sales fetching with pagination and caching
export async function getAllSalesPaginated(page = 1, limit = 50) {
  const cacheKey = `sales:${page}:${limit}:all`;
  
  return withCache(cacheKey, async () => {
    try {
      const skip = (page - 1) * limit;
      
      const where = undefined;

      // Step 1: Get sales with basic data (fast query)
      const sales = await prisma.sale.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          qty: true,
          salePrice: true,
          total: true,
          productName: true,
          productImage: true,
          customerName: true,
          customerEmail: true,
          paymentMethod: true,
          createdAt: true,
          updatedAt: true,
          orderId: true,
          productId: true,
          orderNumber: true,
          // Insurance fields
          insuranceClaimId: true,
          insuranceAmount: true,
          customerPaidAmount: true,
          insurancePercentage: true,
        }
      });

      if (sales.length === 0) {
        return {
          sales: [],
          totalCount: 0,
          totalPages: 0,
          currentPage: page
        };
      }

      // Step 2: Get additional product and order data if needed (in smaller chunks)
      const productIds = [...new Set(sales.map(sale => sale.productId).filter(Boolean))];
      const orderIds = [...new Set(sales.map(sale => sale.orderId).filter(Boolean))];

      // Get product data (limited fields)
      const products = productIds.length > 0 ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          name: true,
          productCode: true,
          productThumbnail: true,
          supplierPrice: true
        }
      }) : [];

      // Get order data (limited fields)
      const orders = orderIds.length > 0 ? await prisma.lineOrder.findMany({
        where: { id: { in: orderIds } },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          customerName: true,
          customerEmail: true
        }
      }) : [];

      // Step 3: Combine data efficiently
      const salesWithDetails = sales.map(sale => ({
        ...sale,
        product: products.find(p => p.id === sale.productId) || null,
        lineOrder: orders.find(o => o.id === sale.orderId) || null
      }));

      // Step 4: Get total count
      const totalCount = await prisma.sale.count({ where });

      return {
        sales: salesWithDetails,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page
      };

    } catch (error) {
      console.error("Failed to fetch sales:", error);
      // Fallback to simple query
      return await getAllSalesSimple(page, limit);
    }
  }, 3 * 60 * 1000); // Cache for 3 minutes
}

// Legacy function for backward compatibility (now optimized)
export async function getAllSales() {
  try {
    // For backward compatibility, get first 100 sales without pagination
    const result = await getAllSalesPaginated(1, 100);
    return result.sales;
  } catch (error) {
    console.error("Error fetching sales:", error);
    return [];
  }
}

// Minimal sales data for dropdowns, etc.
export async function getSalesMinimal(page = 1, limit = 20) {
  return withCache(`sales:minimal:${page}:${limit}`, async () => {
    try {
      const skip = (page - 1) * limit;
      
      const sales = await prisma.sale.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          orderNumber: true,
          productName: true,
          customerName: true,
          salePrice: true,
          qty: true,
          total: true,
          createdAt: true,
        },
      });

      return sales;
    } catch (error) {
      console.error("Error fetching minimal sales:", error);
      return [];
    }
  }, 5 * 60 * 1000); // Cache for 5 minutes
}

export async function getOrderById(id: string) {
  try {
    const order = await prisma.lineOrder.findUnique({
      where: {
        id,
      },
      include: {
        lineOrderItems: true,
      },
    });
    return order as ILineOrder;
  } catch (error) {
    console.log(error);
  }
}
