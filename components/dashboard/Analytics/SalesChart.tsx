"use client";

import { MoveUpRight, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import { subDays, format, eachDayOfInterval } from "date-fns";
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
import { DailySales } from "@/actions/analytics";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function SalesChart({ sales }: { sales: DailySales[] }) {
  // Format start and end dates

  const now = new Date();
  const sevenDaysAgo = subDays(now, 6);
  const startDate = format(sevenDaysAgo, "EEE do MMM");
  const endDate = format(now, "EEE do MMM");
  let highestSalesDay: DailySales = { day: "", sales: 0 };
  sales.forEach((salesDay) => {
    if (salesDay.sales > highestSalesDay.sales) {
      highestSalesDay = salesDay;
    }
  });
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="">
            <CardTitle>Sales Chart </CardTitle>
            <CardDescription>
              {startDate} - {endDate}
            </CardDescription>
          </div>
          <Button variant={"outline"} asChild size={"sm"}>
            <Link href="/dashboard/analytics/sales">
              <span>View All</span>
              <MoveUpRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={sales}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="sales" fill="var(--color-sales)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          The day with hightest sales is {highestSalesDay.day}{" "}
          <TrendingUp className="h-4 w-4" /> with {highestSalesDay.sales} sales
        </div>
        <div className="leading-none text-muted-foreground">
          Showing the sales for the last 7 days including today
        </div>
      </CardFooter>
    </Card>
  );
}
