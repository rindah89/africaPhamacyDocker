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
  //totals Sales
  //Total Revenue
  //Total Orders

  try {
    const sales = await prisma.sale.findMany({
      select: {
        salePrice: true,
        qty: true,
      },
    });
    const salesSummary = calculateSalesSummary(sales);
    const ordersCount = await prisma.lineOrder.count();
    const productsCount = await prisma.product.count();
    const analytics = [
      {
        title: "Total Sales",
        count: salesSummary.salesCount,
        countUnit: "",
        detailLink: "/dashboard/sales",
        icon: BarChartHorizontal,
      },
      {
        title: "Total Revenue",
        count: salesSummary.totalRevenue,
        countUnit: "CFA ",
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
  const now = new Date();
  const sevenDaysAgo = subDays(now, 6); // Start from six days ago to include today

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
export const getRevenueByMainCategoryPastSixMonths = async (): Promise<
  MonthlyMainCategoryRevenue[]
> => {
  // Calculate the start date for the 6-month period
  const sixMonthsAgo = subMonths(new Date(), 5); // Include the current month
  const startOfSixMonthsAgo = startOfMonth(sixMonthsAgo);

  // Fetch all main categories with sales within the last 6 months
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
                        gte: startOfSixMonthsAgo,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // Initialize a map to store monthly revenue for each main category
  const monthlyRevenueMap: { [month: string]: MonthlyMainCategoryRevenue } = {};

  // Populate the map with months and categories
  for (let i = 0; i < 6; i++) {
    const date = subMonths(new Date(), i);
    const month = format(date, "MMMM");

    if (!monthlyRevenueMap[month]) {
      monthlyRevenueMap[month] = { month };
    }

    mainCategories.forEach((mainCategory) => {
      const categoryKey = getFirstWord(mainCategory.title);
      if (!(categoryKey in monthlyRevenueMap[month])) {
        monthlyRevenueMap[month][categoryKey] = 0;
      }
    });
  }

  // Aggregate revenue by month and main category
  mainCategories.forEach((mainCategory) => {
    const categoryKey = getFirstWord(mainCategory.title);
    mainCategory.categories.forEach((category) => {
      category.subCategories.forEach((subCategory) => {
        subCategory.products.forEach((product) => {
          product.sales.forEach((sale) => {
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
  });

  // Convert the map to an array and ensure it conforms to MonthlyMainCategoryRevenue[]
  const mainCategoryRevenueArray: MonthlyMainCategoryRevenue[] =
    Object.values(monthlyRevenueMap).reverse(); // Reverse to have the months in ascending order

  return mainCategoryRevenueArray;
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
