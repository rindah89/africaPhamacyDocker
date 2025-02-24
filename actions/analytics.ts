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
  try {
    // Get sales for the last 30 days only to limit data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [sales, ordersCount, productsCount] = await Promise.all([
      prisma.sale.findMany({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        },
        select: {
          salePrice: true,
          qty: true,
        },
      }),
      prisma.lineOrder.count(),
      prisma.product.count(),
    ]);

    const salesSummary = calculateSalesSummary(sales);
    
    const analytics = [
      {
        title: "Total Sales (30 days)",
        count: salesSummary.salesCount,
        countUnit: "",
        detailLink: "/dashboard/sales",
        icon: BarChartHorizontal,
      },
      {
        title: "Revenue (30 days)",
        count: salesSummary.totalRevenue,
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
  console.log('getSalesCountForPastSevenDays: Starting function');
  const now = new Date();
  const sevenDaysAgo = subDays(now, 6); // Start from six days ago to include today

  console.log('getSalesCountForPastSevenDays: Date range', {
    start: sevenDaysAgo,
    end: now
  });

  // Get all dates for the past 7 days
  const days = eachDayOfInterval({
    start: sevenDaysAgo,
    end: now,
  });

  // Initialize sales count map with 0 sales for each day
  const salesCountMap: { [key: string]: number } = {};
  days.forEach((day) => {
    const formattedDay = format(day, "EEE do MMM");
    salesCountMap[formattedDay] = 0;
  });

  console.log('getSalesCountForPastSevenDays: Initialized days map:', salesCountMap);

  // Fetch sales data for the past 7 days
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

  console.log('getSalesCountForPastSevenDays: Found sales records:', sales.length);

  // Update sales count map with actual sales data
  sales.forEach((sale) => {
    const formattedDay = format(sale.createdAt, "EEE do MMM");
    salesCountMap[formattedDay] += 1;
  });

  // Transform the map into the desired array format
  const salesCountArray: DailySales[] = days.map((day) => {
    const formattedDay = format(day, "EEE do MMM");
    return {
      day: formattedDay,
      sales: salesCountMap[formattedDay],
    };
  });

  console.log('getSalesCountForPastSevenDays: Final processed data:', salesCountArray);
  return salesCountArray;
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
    // Get all sales with null orderNumbers
    const salesWithNullOrders = await prisma.$queryRaw`
      SELECT id, created_at
      FROM Sale
      WHERE order_number IS NULL
    `;

    if (Array.isArray(salesWithNullOrders) && salesWithNullOrders.length > 0) {
      console.log(`Found ${salesWithNullOrders.length} sales with null orderNumbers`);

      // Update each sale with a new order number
      for (const sale of salesWithNullOrders) {
        const timestamp = new Date(sale.created_at).getTime();
        const newOrderNumber = `FIX-${timestamp}-${sale.id}`;
        
        await prisma.$executeRaw`
          UPDATE Sale
          SET order_number = ${newOrderNumber}
          WHERE id = ${sale.id}
        `;
      }

      console.log('Fixed all null orderNumbers');
      return salesWithNullOrders.length;
    }

    return 0;
  } catch (error) {
    console.error('Error fixing null orderNumbers:', error);
    throw error;
  }
}

export const getRevenueByMainCategoryPastSixMonths = async (): Promise<
  MonthlyMainCategoryRevenue[]
> => {
  console.log('getRevenueByMainCategoryPastSixMonths: Starting function');
  
  try {
    // Calculate the start date for the 6-month period
    const sixMonthsAgo = subMonths(new Date(), 5);
    const startOfSixMonthsAgo = startOfMonth(sixMonthsAgo);

    // Now fetch the main categories and their sales data
    const mainCategories = await prisma.mainCategory.findMany({
      include: {
        categories: {
          include: {
            subCategories: {
              include: {
                products: {
                  include: {
                    sales: {
                      where: {
                        createdAt: {
                          gte: startOfSixMonthsAgo
                        }
                      },
                      select: {
                        salePrice: true,
                        createdAt: true
                      }
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Initialize monthly revenue map
    const monthlyRevenueMap: { [month: string]: MonthlyMainCategoryRevenue } = {};

    // Setup the months
    for (let i = 0; i < 6; i++) {
      const date = subMonths(new Date(), i);
      const month = format(date, "MMMM");
      monthlyRevenueMap[month] = { month };

      // Initialize all category revenues to 0
      mainCategories.forEach((mainCategory) => {
        const categoryKey = getFirstWord(mainCategory.title);
        monthlyRevenueMap[month][categoryKey] = 0;
      });
    }

    // Calculate revenue for each category and month
    mainCategories.forEach((mainCategory) => {
      const categoryKey = getFirstWord(mainCategory.title);
      let totalSales = 0;

      mainCategory.categories.forEach((category) => {
        category.subCategories.forEach((subCategory) => {
          subCategory.products.forEach((product) => {
            product.sales.forEach((sale) => {
              totalSales++;
              const saleMonth = format(sale.createdAt, "MMMM");
              if (monthlyRevenueMap[saleMonth]) {
                monthlyRevenueMap[saleMonth][categoryKey] =
                  (monthlyRevenueMap[saleMonth][categoryKey] as number) +
                  sale.salePrice;
              }
            });
          });
        });
      });
      console.log(`Processed ${totalSales} sales for category ${categoryKey}`);
    });

    // Convert to array and sort in reverse chronological order
    const mainCategoryRevenueArray: MonthlyMainCategoryRevenue[] =
      Object.values(monthlyRevenueMap).reverse();

    return mainCategoryRevenueArray;
  } catch (error) {
    console.error('Error in getRevenueByMainCategoryPastSixMonths:', error);
    throw error;
  }
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
