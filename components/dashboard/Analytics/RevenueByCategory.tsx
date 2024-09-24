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
import React from "react";
import { formatMoney } from "@/lib/formatMoney";

const colors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  // Add more colors as needed
];

export function generateChartConfig(
  mainCategoryRevenueArray: MonthlyMainCategoryRevenue[]
): ChartConfig {
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
      color: colors[index % colors.length], // Cycle through colors if there are more categories than colors
    };
  });

  return chartConfig;
}
const calculateTotalRevenueAndLeadingMonthAndCategory = (
  categoryRevenueData: MonthlyMainCategoryRevenue[]
) => {
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

  return { totalRevenue, leadingMonth, leadingCategory };
};
export function RevenueByCategory({
  categoryRevenueData,
}: {
  categoryRevenueData: MonthlyMainCategoryRevenue[];
}) {
  const chartConfig = generateChartConfig(categoryRevenueData);
  const { totalRevenue, leadingMonth, leadingCategory } =
    calculateTotalRevenueAndLeadingMonthAndCategory(categoryRevenueData);
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
            {
              // Generate Bar components for each category
              Object.keys(chartConfig).map((category) => (
                <Bar
                  key={category}
                  dataKey={category}
                  fill={chartConfig[category].color}
                  radius={4}
                />
              ))
            }
            {/* <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} /> */}
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
}
