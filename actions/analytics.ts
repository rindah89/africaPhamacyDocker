"use server";

import prisma, { withTimeout } from "@/lib/db";
import {
  BarChartHorizontal,
  Combine,
  DollarSign,
  LayoutGrid,
  Loader,
  LucideProps,
} from "lucide-react";
import { revalidatePath } from "next/cache";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import {
  subDays,
  format,
  eachDayOfInterval,
  subMonths,
  startOfMonth,
} from "date-fns";
import { withCache, cacheKeys } from "@/lib/cache";
import { executeWithConnectionRetry } from "@/lib/db-health";

interface Sale {
  salePrice: number;
  qty: number;
}
export interface DailySales {
  day: string;
  sales: number;
}

export interface SalesSummary {
  salesCount: number;
  totalRevenue: number;
}
export interface AnalyticsProps {
  title: string;
  count: number;
  detailLink: string;
  countUnit?: "";
  iconName: string;
}
function calculateSalesSummary(sales: Sale[]): SalesSummary {
  const summary = sales.reduce(
    (acc, sale) => {
      acc.salesCount += sale.qty;
      acc.totalRevenue += sale.salePrice * sale.qty;
      return acc;
    },
    { salesCount: 0, totalRevenue: 0 }
  );

  return summary;
}
export const getAnalytics = async () => {
  console.log('🔍 getAnalytics - Function called');
  
  return withCache(cacheKeys.analytics(), async () => {
    return executeWithConnectionRetry(async () => {
      const now = new Date();
      const thirtyDaysAgo = subDays(now, 30);

      console.log('🔍 getAnalytics - Date range:', {
        now: now.toISOString(),
        thirtyDaysAgo: thirtyDaysAgo.toISOString()
      });

      // Use Promise.allSettled for better error handling - get what we can
      console.log('🔍 getAnalytics - Starting optimized parallel database queries...');
      
      // Use shorter timeouts and simpler queries for serverless
      const results = await Promise.allSettled([
        // Ultra-fast sales aggregation with timeout
        withTimeout(
          prisma.sale.aggregate({
            where: {
              createdAt: {
                gte: thirtyDaysAgo,
              },
            },
            _count: { id: true },
            _sum: { salePrice: true }
          }),
          8000 // 8 second timeout
        ),

        // Fast counts with timeout
        withTimeout(prisma.lineOrder.count(), 3000),
        withTimeout(prisma.product.count(), 3000),

        // Quick sample data check
        withTimeout(
          prisma.sale.findFirst({
            select: { id: true, createdAt: true },
            orderBy: { createdAt: 'desc' }
          }),
          2000
        )
      ]);

      console.log('🔍 getAnalytics - Database queries completed:', {
        salesResult: results[0].status,
        ordersResult: results[1].status,
        productsResult: results[2].status,
        sampleResult: results[3].status
      });

      const [salesResult, ordersResult, productsResult, sampleResult] = results;

      // Extract data with fallbacks
      const salesData = salesResult.status === 'fulfilled' ? salesResult.value : { _count: { id: 0 }, _sum: { salePrice: 0 } };
      const ordersCount = ordersResult.status === 'fulfilled' ? ordersResult.value : 0;
      const productsCount = productsResult.status === 'fulfilled' ? productsResult.value : 0;

      console.log('🔍 getAnalytics - Raw database data:', {
        salesData: {
          success: salesResult.status === 'fulfilled',
          count: salesData._count.id,
          revenue: salesData._sum.salePrice,
          error: salesResult.status === 'rejected' ? salesResult.reason : null
        },
        ordersCount: {
          success: ordersResult.status === 'fulfilled',
          count: ordersCount,
          error: ordersResult.status === 'rejected' ? ordersResult.reason : null
        },
        productsCount: {
          success: productsResult.status === 'fulfilled',
          count: productsCount,
          error: productsResult.status === 'rejected' ? productsResult.reason : null
        },
        sampleData: {
          success: sampleResult.status === 'fulfilled',
          data: sampleResult.status === 'fulfilled' ? sampleResult.value : null,
          error: sampleResult.status === 'rejected' ? sampleResult.reason : null
        }
      });

      console.log('🔍 getAnalytics - Processed analytics data:', {
        salesCount: salesData._count.id,
        revenue: salesData._sum.salePrice,
        orders: ordersCount,
        products: productsCount
      });

      const analytics = [
        {
          title: "Total Sales (30 days)",
          count: salesData._count.id || 0,
          countUnit: "",
          detailLink: "/dashboard/sales",
          iconName: "BarChartHorizontal",
        },
        {
          title: "Revenue (30 days)",
          count: salesData._sum.salePrice || 0,
          countUnit: " ",
          detailLink: "/dashboard/sales",
          iconName: "DollarSign",
        },
        {
          title: "Total Orders",
          count: ordersCount,
          countUnit: "",
          detailLink: "/dashboard/sales/orders",
          iconName: "Combine",
        },
        {
          title: "Total Products",
          count: productsCount,
          countUnit: "",
          detailLink: "/dashboard/inventory/products",
          iconName: "LayoutGrid",
        },
      ];
      
      console.log('🔍 getAnalytics - Final analytics array:', {
        analytics,
        analyticsLength: analytics.length,
        analyticsData: analytics.map((item, i) => ({
          index: i,
          title: item.title,
          count: item.count,
          countUnit: item.countUnit,
          iconName: item.iconName
        }))
      });
      
      return analytics as AnalyticsProps[];
    }, 'Analytics fetch')
    .catch(error => {
      console.error('🔍 getAnalytics - Connection error, using fallback:', error);
      
      // Return fallback analytics
      const fallbackAnalytics = [
        {
          title: "Total Sales (30 days)",
          count: 0,
          countUnit: "",
          detailLink: "/dashboard/sales",
          iconName: "BarChartHorizontal",
        },
        {
          title: "Revenue (30 days)",
          count: 0,
          countUnit: " ",
          detailLink: "/dashboard/sales",
          iconName: "DollarSign",
        },
        {
          title: "Total Orders",
          count: 0,
          countUnit: "",
          detailLink: "/dashboard/sales/orders",
          iconName: "Combine",
        },
        {
          title: "Total Products",
          count: 0,
          countUnit: "",
          detailLink: "/dashboard/inventory/products",
          iconName: "LayoutGrid",
        },
      ] as AnalyticsProps[];
      
      console.log('🔍 getAnalytics - Returning fallback analytics:', fallbackAnalytics);
      return fallbackAnalytics;
    });
  }, 15 * 60 * 1000); // Cache for 15 minutes
};

export const getSalesCountForPastSevenDaysOld = async (): Promise<
  DailySales[]
> => {
  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);

  const sales = await prisma.sale.findMany({
    where: {
      createdAt: {
        gte: sevenDaysAgo,
        lte: now,
      },
    },
    select: {
      createdAt: true,
    },
  });

  // Create a map to store sales counts per day
  const salesCountMap: { [key: string]: number } = {};

  sales.forEach((sale) => {
    const day = format(sale.createdAt, "EEE do MMM");
    salesCountMap[day] = (salesCountMap[day] || 0) + 1;
  });

  // Transform the map into the desired array format
  const salesCountArray: DailySales[] = Object.entries(salesCountMap).map(
    ([day, sales]) => ({
      day,
      sales,
    })
  );

  return salesCountArray;
};

export const getSalesCountForPastSevenDays = async (): Promise<DailySales[]> => {
  return withCache(cacheKeys.salesCountPastSevenDays(), async () => {
    try {
      const now = new Date();
      const sevenDaysAgo = subDays(now, 6);
      const sales = await prisma.sale.findMany({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
            lte: now,
          },
        },
        select: {
          createdAt: true,
        },
      });
      // Group by day in JS
      const salesCountMap: { [key: string]: number } = {};
      const days = eachDayOfInterval({ start: sevenDaysAgo, end: now });
      days.forEach((day) => {
        const formattedDay = format(day, "EEE do MMM");
        salesCountMap[formattedDay] = 0;
      });
      sales.forEach((sale) => {
        const day = format(sale.createdAt, "EEE do MMM");
        if (salesCountMap.hasOwnProperty(day)) {
          salesCountMap[day]++;
        }
      });
      const result = days.map((day) => ({
        day: format(day, "EEE do MMM"),
        sales: salesCountMap[format(day, "EEE do MMM")] || 0,
      }));
      return result;
    } catch (error) {
      console.error('getSalesCountForPastSevenDays error:', error);
      const now = new Date();
      const sevenDaysAgo = subDays(now, 6);
      const days = eachDayOfInterval({ start: sevenDaysAgo, end: now });
      return days.map((day) => ({
        day: format(day, "EEE do MMM"),
        sales: 0,
      }));
    }
  }, 30 * 60 * 1000);
};

export interface MainCategorySales {
  title: string;
  sales: number;
}
export interface MainCategoryRevenue {
  title: string;
  revenue: number;
}
export const getSalesCountByMainCategory = async (): Promise<
  MainCategorySales[]
> => {
  // Fetch all main categories
  const mainCategories = await prisma.mainCategory.findMany({
    include: {
      categories: {
        include: {
          subCategories: {
            include: {
              products: {
                include: {
                  sales: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Aggregate sales count by main category
  const mainCategorySales: MainCategorySales[] = mainCategories.map(
    (mainCategory) => {
      let totalSales = 0;

      mainCategory.categories.forEach((category) => {
        category.subCategories.forEach((subCategory) => {
          subCategory.products.forEach((product) => {
            totalSales += product.sales.length;
          });
        });
      });

      return {
        title: mainCategory.title,
        sales: totalSales,
      };
    }
  );

  return mainCategorySales;
};
export const getRevenueByMainCategory = async (): Promise<
  MainCategoryRevenue[]
> => {
  // Fetch all main categories
  const mainCategories = await prisma.mainCategory.findMany({
    include: {
      categories: {
        include: {
          subCategories: {
            include: {
              products: {
                include: {
                  sales: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Aggregate revenue by main category
  const mainCategoryRevenue: MainCategoryRevenue[] = mainCategories.map(
    (mainCategory) => {
      let totalRevenue = 0;

      mainCategory.categories.forEach((category) => {
        category.subCategories.forEach((subCategory) => {
          subCategory.products.forEach((product) => {
            product.sales.forEach((sale) => {
              totalRevenue += sale.salePrice;
            });
          });
        });
      });

      return {
        title: mainCategory.title,
        revenue: totalRevenue,
      };
    }
  );

  return mainCategoryRevenue;
};
export interface MonthlyMainCategoryRevenue {
  month: string;
  [category: string]: number | string;
}
const getFirstWord = (str: string) => str.split(" ")[0];
async function checkAndFixSalesData() {
  console.log('Checking sales data for null orderNumbers...');
  
  try {
    // First, let's count how many sales have null orderNumbers
    const nullOrderNumberCount = await prisma.sale.count({
      where: {
        orderNumber: null
      }
    });

    console.log(`Found ${nullOrderNumberCount} sales with null orderNumbers`);

    if (nullOrderNumberCount > 0) {
      // Get all sales with null orderNumbers
      const salesWithNullOrders = await prisma.sale.findMany({
        where: {
          orderNumber: null
        },
        include: {
          product: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      console.log('Sample of affected sales:', salesWithNullOrders.slice(0, 3));

      // Generate new order numbers and update the sales
      const updates = salesWithNullOrders.map((sale, index) => {
        const timestamp = sale.createdAt.getTime();
        const newOrderNumber = `FIX-${timestamp}-${index + 1}`;
        
        return prisma.sale.update({
          where: { id: sale.id },
          data: { orderNumber: newOrderNumber }
        });
      });

      console.log('Fixing sales records...');
      await prisma.$transaction(updates);
      console.log('Fixed all sales records with null orderNumbers');
    }

    return nullOrderNumberCount;
  } catch (error) {
    console.error('Error checking/fixing sales data:', error);
    throw error;
  }
}

async function fixNullOrderNumbers() {
  try {
    // Get all sales with null orderNumbers using MongoDB-compatible query
    const salesWithNullOrders = await prisma.sale.findMany({
      where: {
        orderNumber: null
      },
      select: {
        id: true,
        createdAt: true
      }
    });

    if (salesWithNullOrders.length > 0) {
      console.log(`Found ${salesWithNullOrders.length} sales with null orderNumbers`);

      // Update each sale with a new order number using MongoDB-compatible updates
      const updates = salesWithNullOrders.map((sale) => {
        const timestamp = sale.createdAt.getTime();
        const newOrderNumber = `FIX-${timestamp}-${sale.id}`;
        
        return prisma.sale.update({
          where: { id: sale.id },
          data: { orderNumber: newOrderNumber }
        });
      });

      await prisma.$transaction(updates);
      console.log('Fixed all null orderNumbers');
      return salesWithNullOrders.length;
    }

    return 0;
  } catch (error) {
    console.error('Error fixing null orderNumbers:', error);
    throw error;
  }
}

export const getRevenueByMainCategoryPastSixMonths = async (): Promise<MonthlyMainCategoryRevenue[]> => {
  return withCache(cacheKeys.revenueByCategory(), async () => {
    try {
      const currentDate = new Date();
      const sixMonthsAgo = subMonths(currentDate, 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);
      // Fetch all sales in the last 6 months, including full nested relations
      const sales = await prisma.sale.findMany({
        where: {
          createdAt: {
            gte: sixMonthsAgo,
            lte: currentDate,
          },
        },
        include: {
          product: {
            include: {
              subCategory: {
                include: {
                  category: {
                    include: {
                      mainCategory: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      // Group and sum revenue by month and main category
      const monthlyRevenueMap: { [month: string]: MonthlyMainCategoryRevenue } = {};
      for (let i = 0; i < 6; i++) {
        const monthDate = subMonths(currentDate, i);
        const monthKey = format(monthDate, "MMMM");
        monthlyRevenueMap[monthKey] = { month: monthKey };
      }
      sales.forEach((sale) => {
        const month = format(sale.createdAt, "MMMM");
        const mainCategory = sale.product?.subCategory?.category?.mainCategory?.title || 'Unknown';
        if (!monthlyRevenueMap[month][mainCategory]) {
          monthlyRevenueMap[month][mainCategory] = 0;
        }
        monthlyRevenueMap[month][mainCategory] = (monthlyRevenueMap[month][mainCategory] as number) + (sale.salePrice || 0);
      });
      const result = Object.values(monthlyRevenueMap).sort((a, b) => {
        const indexA = Array.from({length: 6}, (_, i) => format(subMonths(currentDate, i), "MMMM")).indexOf(a.month);
        const indexB = Array.from({length: 6}, (_, i) => format(subMonths(currentDate, i), "MMMM")).indexOf(b.month);
        return indexA - indexB;
      });
      return result;
    } catch (error) {
      console.error('Error in getRevenueByMainCategoryPastSixMonths:', error);
      const currentDate = new Date();
      return Array.from({length: 6}, (_, i) => ({
        month: format(subMonths(currentDate, i), "MMMM")
      }));
    }
  }, 30 * 60 * 1000);
};

export async function getProductsCount() {
  try {
    const productsCount = await prisma.product.count();
    return productsCount;
  } catch (error) {
    console.log(error);
    return 0;
  }
}
export async function getUsersCount() {
  try {
    const usersCount = await prisma.user.count();
    return usersCount;
  } catch (error) {
    console.log(error);
    return 0;
  }
}
export async function getOrdersCount() {
  try {
    const ordersCount = await prisma.lineOrder.count();
    return ordersCount;
  } catch (error) {
    console.log(error);
    return 0;
  }
}
