"use server";

import prisma from "@/lib/db";
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
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
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
export async function getAnalytics() {
  return withCache(cacheKeys.analytics(), async () => {
    try {
      // Get sales for the last 30 days only to limit data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Use Promise.all for parallel execution and optimize queries
      const [salesData, ordersCount, productsCount] = await Promise.all([
        // Optimized sales query with aggregation
        prisma.sale.aggregate({
          where: {
            createdAt: {
              gte: thirtyDaysAgo
            }
          },
          _sum: {
            salePrice: true,
            qty: true,
          },
          _count: {
            id: true,
          }
        }),
        // Use cached count for better performance
        withCache(cacheKeys.orderCount(), async () => {
          return prisma.lineOrder.count();
        }, 15 * 60 * 1000), // Cache for 15 minutes
        // Cache this count as it changes rarely
        withCache(cacheKeys.productCount(), async () => {
          return prisma.product.count({
            where: {
              status: true
            }
          });
        }, 30 * 60 * 1000), // Cache for 30 minutes
      ]);

      const analytics = [
        {
          title: "Total Sales (30 days)",
          count: salesData._count.id || 0,
          countUnit: "",
          detailLink: "/dashboard/sales",
          icon: BarChartHorizontal,
        },
        {
          title: "Revenue (30 days)",
          count: salesData._sum.salePrice || 0,
          countUnit: " ",
          detailLink: "/dashboard/sales",
          icon: DollarSign,
        },
        {
          title: "Total Orders",
          count: ordersCount,
          countUnit: "",
          detailLink: "/dashboard/sales/orders",
          icon: Combine,
        },
        {
          title: "Total Products",
          count: productsCount,
          countUnit: "",
          detailLink: "/dashboard/inventory/products",
          icon: LayoutGrid,
        },
      ];
      return analytics as AnalyticsProps[];
    } catch (error) {
      console.log(error);
      return null;
    }
  }, 10 * 60 * 1000); // Increased cache time to 10 minutes
}

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

export const getSalesCountForPastSevenDays = async (): Promise<
  DailySales[]
> => {
  return withCache(cacheKeys.salesCountPastSevenDays(), async () => {
    console.log('getSalesCountForPastSevenDays: Starting optimized function');
    const now = new Date();
    const sevenDaysAgo = subDays(now, 6); // Start from six days ago to include today
    sevenDaysAgo.setHours(0,0,0,0); // Normalize to start of day
    const todayEnd = new Date(now);
    todayEnd.setHours(23,59,59,999); // Normalize to end of day

    console.log('getSalesCountForPastSevenDays: Date range', {
      start: sevenDaysAgo,
      end: todayEnd
    });

    const days = eachDayOfInterval({
      start: sevenDaysAgo,
      end: now,
    });

    // Initialize map with all days set to 0
    const salesCountMap: { [key: string]: number } = {};
    days.forEach((day) => {
      const formattedDay = format(day, "EEE do MMM");
      salesCountMap[formattedDay] = 0;
    });

    console.log('getSalesCountForPastSevenDays: Initialized days map:', salesCountMap);

    // Use MongoDB-compatible query (raw SQL not supported in MongoDB)
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
          lte: todayEnd,
        },
      },
      select: {
        createdAt: true,
      },
    });

    console.log('getSalesCountForPastSevenDays: Found sales:', sales.length);

    sales.forEach((sale) => {
      const day = format(sale.createdAt, "EEE do MMM");
      if (salesCountMap.hasOwnProperty(day)) {
        salesCountMap[day] += 1;
      }
    });

    console.log('getSalesCountForPastSevenDays: Final sales count map:', salesCountMap);

    // Transform the map into the desired array format, maintaining day order
    const salesCountArray: DailySales[] = days.map((day) => {
      const formattedDay = format(day, "EEE do MMM");
      return {
        day: formattedDay,
        sales: salesCountMap[formattedDay] || 0,
      };
    });

    console.log('getSalesCountForPastSevenDays: Returning array:', salesCountArray);
    return salesCountArray;
  }, 15 * 60 * 1000); // Cache for 15 minutes
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
      console.log('Starting getRevenueByMainCategoryPastSixMonths...');
      
      const currentDate = new Date();
      const sixMonthsAgo = subMonths(currentDate, 5); // Go back 5 months to include the current month fully
      sixMonthsAgo.setDate(1); // Start from the beginning of the month
      sixMonthsAgo.setHours(0, 0, 0, 0); // Normalize to start of the day

      console.log('Date range:', { from: sixMonthsAgo, to: currentDate });

      const salesData = await prisma.sale.findMany({
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
        orderBy: {
          createdAt: 'desc',
        },
      });

      console.log('Fetched sales data:', salesData.length, 'records');

      const monthlyRevenueMap: { [key: string]: MonthlyMainCategoryRevenue } = {};

      // Initialize months for the last 6 full months including the current month
      for (let i = 0; i < 6; i++) {
        const monthDate = subMonths(currentDate, i);
        const monthKey = format(monthDate, "MMMM"); // Full month name e.g., "June"
        if (!monthlyRevenueMap[monthKey]) { // Ensure not to overwrite if multiple calls create same key (though logic prevents this here)
            monthlyRevenueMap[monthKey] = { month: monthKey };
        }
      }
      
      salesData.forEach((sale) => {
        if (sale.product && sale.product.subCategory && sale.product.subCategory.category && sale.product.subCategory.category.mainCategory) {
          const saleMonth = format(new Date(sale.createdAt), "MMMM");
          const mainCategoryTitle = sale.product.subCategory.category.mainCategory.title;
          const categoryKey = getFirstWord(mainCategoryTitle);

          if (monthlyRevenueMap[saleMonth]) {
            monthlyRevenueMap[saleMonth][categoryKey] = 
              (monthlyRevenueMap[saleMonth][categoryKey] as number || 0) + sale.salePrice;
          }
        }
      });
      
      // Ensure all initialized months are in the final array, even if they have no sales
      const allMonthsKeys = Object.keys(monthlyRevenueMap);
      const mainCategoryRevenueArray: MonthlyMainCategoryRevenue[] = allMonthsKeys.map(monthKey => {
          return monthlyRevenueMap[monthKey];
      }).sort((a, b) => {
          // Sort by month, ensuring correct chronological order from most recent to oldest
          const dateA = new Date(Date.parse(a.month +" 1, 2000")); // Use a dummy year for sorting
          const dateB = new Date(Date.parse(b.month +" 1, 2000"));
          // Find the index in our original initialized order
          const indexA = Array.from({length: 6}, (_, i) => format(subMonths(currentDate, i), "MMMM")).indexOf(a.month);
          const indexB = Array.from({length: 6}, (_, i) => format(subMonths(currentDate, i), "MMMM")).indexOf(b.month);
          return indexA - indexB;
      });


      console.log('Processed revenue data:', mainCategoryRevenueArray.length, 'months');
      return mainCategoryRevenueArray;
    } catch (error) {
      console.error('Error in getRevenueByMainCategoryPastSixMonths:', error);
      const monthlyRevenueMap: { [key: string]: MonthlyMainCategoryRevenue } = {};
      for (let i = 0; i < 6; i++) {
        const monthDate = subMonths(new Date(), i);
        const monthKey = format(monthDate, "MMMM");
        monthlyRevenueMap[monthKey] = { month: monthKey };
      }
      // Sort months from most recent to oldest in the error case as well
      return Object.values(monthlyRevenueMap).sort((a,b) => {
        const indexA = Array.from({length: 6}, (_, i) => format(subMonths(new Date(), i), "MMMM")).indexOf(a.month);
        const indexB = Array.from({length: 6}, (_, i) => format(subMonths(new Date(), i), "MMMM")).indexOf(b.month);
        return indexA - indexB;
      });
    }
  }, 10 * 60 * 1000); // Cache for 10 minutes
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
