import React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransactionsList from "../TransactionsList";
import BarChartCard from "./BarChartCard";
import { getOrders } from "@/actions/pos";
import OrderSummary from "../OrderSummary";
import { getCustomers } from "@/actions/orders";
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
export default async function DashboardSummary() {
  const orders = (await getOrders()) || [];
  const bestSellingProducts = (await getBestSellingProducts(3)) || [];
  const customers = (await getCustomers()) || [];
  return (
    <Tabs defaultValue="orders">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="products">Best Selling Products</TabsTrigger>
          <TabsTrigger value="customers">Recent Customers</TabsTrigger>
          <TabsTrigger value="year">Year</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="orders">
        <OrderSummary orders={orders} />
      </TabsContent>
      <TabsContent value="products">
        <BestSellingProducts products={bestSellingProducts} />
      </TabsContent>
      <TabsContent value="customers">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="">
                <CardTitle>Recent Customers({customers.length})</CardTitle>
                <CardDescription>
                  View the most recent Customers
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
            <DataTable columns={columns} data={customers.slice(0, 5)} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="year">
        <BarChartCard />
      </TabsContent>
    </Tabs>
  );
}
