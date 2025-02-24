import React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { formatMoney } from "@/lib/formatMoney";
type TableAnalyticsProps = {
  data: any[];
  tableTitle: string;
};
export default function TableAnalytics({
  data,
  tableTitle,
}: TableAnalyticsProps) {
  const count = data.length;
  const salesRevenue = data.reduce((acc, item) => {
    return acc + item.qty * item.salePrice;
  }, 0);
  const ordersRevenue = data.reduce((acc, item) => {
    return acc + item.orderAmount;
  }, 0);
  return (
    <div>
      <Card>
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <CardTitle>
              {tableTitle === "sales" ? "Sales Analytics" : "Orders Analytics"}
            </CardTitle>
            <CardDescription>
              {`Showing the perfomance of ${
                tableTitle === "sales" ? "Sales" : "Orders"
              } over time`}
            </CardDescription>
          </div>
          <div className="flex">
            <button className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
              <span className="text-xs text-muted-foreground">
                Total {tableTitle == "sales" ? "Sales" : "Orders"}
              </span>
              <span className="text-lg font-bold leading-none sm:text-3xl">
                {count}
              </span>
            </button>
            <button className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
              <span className="text-xs text-muted-foreground">
                Total Revenue
              </span>
              <span className="text-lg font-bold leading-none sm:text-3xl">
                {tableTitle === "sales"
                  ? formatMoney(salesRevenue)
                  : formatMoney(ordersRevenue)}
              </span>
            </button>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
