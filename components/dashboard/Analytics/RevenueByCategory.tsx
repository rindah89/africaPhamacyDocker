"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { MonthlyMainCategoryRevenue } from "@/actions/analytics";
import React, { useEffect } from "react";
import { formatMoney } from "@/lib/formatMoney";

console.log('RevenueByCategory: Module initialization');

const colors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  // Add more colors as needed
];

const generateChartConfig = (
  mainCategoryRevenueArray: MonthlyMainCategoryRevenue[]
): ChartConfig => {
  console.log('RevenueByCategory: Generating chart config with data:', JSON.stringify(mainCategoryRevenueArray, null, 2));
  
  const chartConfig: ChartConfig = {};

  // Extract unique category keys
  const categoryKeys = new Set<string>();
  mainCategoryRevenueArray.forEach((entry) => {
    Object.keys(entry).forEach((key) => {
      if (key !== "month") {
        categoryKeys.add(key);
      }
    });
  });

  // Assign labels and colors to the categories
  Array.from(categoryKeys).forEach((category, index) => {
    chartConfig[category] = {
      label: category,
      color: colors[index % colors.length],
    };
  });

  console.log('RevenueByCategory: Generated chart config:', chartConfig);
  return chartConfig;
};

const calculateTotalRevenueAndLeadingMonthAndCategory = (
  categoryRevenueData: MonthlyMainCategoryRevenue[]
) => {
  console.log('RevenueByCategory: Calculating metrics from data:', JSON.stringify(categoryRevenueData, null, 2));
  
  let totalRevenue = 0;
  let leadingMonth = "";
  let maxMonthlyRevenue = 0;
  let leadingCategory = "";

  categoryRevenueData.forEach((monthData) => {
    let monthlyRevenue = 0;
    const categoryRevenues: { [key: string]: number } = {};

    Object.keys(monthData).forEach((key) => {
      if (key !== "month") {
        const revenue = monthData[key] as number;
        monthlyRevenue += revenue;
        categoryRevenues[key] = revenue;
      }
    });

    if (monthlyRevenue > maxMonthlyRevenue) {
      maxMonthlyRevenue = monthlyRevenue;
      leadingMonth = monthData.month;

      // Find the category with the highest revenue in the leading month
      let maxCategoryRevenue = 0;
      Object.keys(categoryRevenues).forEach((category) => {
        if (categoryRevenues[category] > maxCategoryRevenue) {
          maxCategoryRevenue = categoryRevenues[category];
          leadingCategory = category;
        }
      });
    }

    totalRevenue += monthlyRevenue;
  });

  const metrics = { totalRevenue, leadingMonth, leadingCategory };
  console.log('RevenueByCategory: Calculated metrics:', metrics);
  return metrics;
};

const RevenueByCategory = ({
  categoryRevenueData,
}: {
  categoryRevenueData: MonthlyMainCategoryRevenue[];
}) => {
  console.log('RevenueByCategory: Component rendering started');

  useEffect(() => {
    console.log('RevenueByCategory: Component mounted');
    return () => {
      console.log('RevenueByCategory: Component unmounting');
    };
  }, []);

  try {
    console.log('RevenueByCategory: Processing data:', JSON.stringify(categoryRevenueData, null, 2));
    
    const chartConfig = generateChartConfig(categoryRevenueData);
    const { totalRevenue, leadingMonth, leadingCategory } =
      calculateTotalRevenueAndLeadingMonthAndCategory(categoryRevenueData);
    
    console.log('RevenueByCategory: Attempting to render chart');
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue By Category Chart</CardTitle>
          <CardDescription>
            <span className="text-lg font-bold leading-none sm:text-xl">
              Total : CFA {formatMoney(totalRevenue)}
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={categoryRevenueData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              {Object.keys(chartConfig).map((category) => (
                <Bar
                  key={category}
                  dataKey={category}
                  fill={chartConfig[category].color}
                  radius={4}
                />
              ))}
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none">
            Leading Month is {leadingMonth} and leading Category is{" "}
            {leadingCategory}
          </div>
          <div className="leading-none text-muted-foreground">
            Showing total revenue for the past 6 months
          </div>
        </CardFooter>
      </Card>
    );
  } catch (error) {
    console.error('RevenueByCategory: Error rendering chart:', error);
    throw error;
  }
};

export default RevenueByCategory;
