import React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransactionsList from "../TransactionsList";
import BarChartCard from "./BarChartCard";
import { getRecentOrdersForDashboard } from "@/actions/pos";
import OrderSummary from "../OrderSummary";
import { getRecentCustomersForDashboard } from "@/actions/orders";
import DataTable from "@/components/DataTableComponents/DataTable";
import { columns } from "@/app/(back-office)/dashboard/sales/customers/columns";
import { getBestSellingProducts } from "@/actions/products";
import BestSellingProducts from "../BestSellingProducts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MoveUpRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default async function DashboardSummary() {
  const [ordersData, bestSellingProductsData, customersData] = await Promise.all([
    getRecentOrdersForDashboard(5).catch(e => { 
      console.error("Failed to fetch recent orders for summary:", e);
      return { error: true, message: e.message || "Error fetching orders" }; 
    }),
    getBestSellingProducts(3).catch(e => { 
      console.error("Failed to fetch best selling products for summary:", e);
      return { error: true, message: e.message || "Error fetching products" }; 
    }),
    getRecentCustomersForDashboard(5).catch(e => { 
      console.error("Failed to fetch recent customers for summary:", e);
      return { error: true, message: e.message || "Error fetching customers" }; 
    })
  ]);

  // Helper to render error or fallback for a data section
  const renderDataSection = (data: any, dataName: string, ContentComponent: React.FC<any>, contentProps: any) => {
    if (data && data.error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading {dataName}</AlertTitle>
          <AlertDescription>{typeof data.message === 'string' ? data.message : 'An unknown error occurred.'}</AlertDescription>
        </Alert>
      );
    }
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return <p className="text-sm text-muted-foreground p-4">No {dataName.toLowerCase()} to display.</p>;
    }
    return <ContentComponent {...contentProps} />;
  };

  return (
    <Tabs defaultValue="orders">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="products">Best Selling Products</TabsTrigger>
          <TabsTrigger value="customers">Recent Customers</TabsTrigger>
          {/* <TabsTrigger value="year">Year</TabsTrigger> */}
        </TabsList>
      </div>
      <TabsContent value="orders">
        {renderDataSection(ordersData, "Recent Orders", OrderSummary, { orders: Array.isArray(ordersData) ? ordersData : [] })}
      </TabsContent>
      <TabsContent value="products">
        {renderDataSection(bestSellingProductsData, "Best Selling Products", BestSellingProducts, { products: Array.isArray(bestSellingProductsData) ? bestSellingProductsData : [] })}
      </TabsContent>
      <TabsContent value="customers">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Customers ({(Array.isArray(customersData) && !customersData.error ? customersData.length : 0)})</CardTitle>
                <CardDescription>
                  {(Array.isArray(customersData) && !customersData.error && customersData.length > 0) 
                    ? `View the ${customersData.length} most recent Customers` 
                    : "Recently active customers"}
                </CardDescription>
              </div>
              <Button asChild size={"sm"}>
                <Link href="/dashboard/sales/customers">
                  <span>View All</span>
                  <MoveUpRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {renderDataSection(customersData, "Recent Customers", DataTable, { columns: columns, data: Array.isArray(customersData) ? customersData : [] })}
          </CardContent>
        </Card>
      </TabsContent>
      {/* <TabsContent value="year">
        <BarChartCard />
      </TabsContent> */}
    </Tabs>
  );
}
