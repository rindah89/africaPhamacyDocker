"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrderSummary from "../OrderSummary";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardSummary } from "@/hooks/use-dashboard-data";

export default function DashboardSummary() {
  const { ordersData, bestSellingProducts, customersData, loading, error } = useDashboardSummary();

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

  if (loading) {
    return <SummarySkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="orders">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="products">Best Selling Products</TabsTrigger>
          <TabsTrigger value="customers">Recent Customers</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="orders">
        {renderDataSection(ordersData, "Recent Orders", OrderSummary, { orders: Array.isArray(ordersData) ? ordersData : [] })}
      </TabsContent>
      <TabsContent value="products">
        <Card>
          <CardHeader>
            <CardTitle>Best Selling Products</CardTitle>
            <CardDescription>
              {bestSellingProducts && bestSellingProducts.length > 0 
                ? `Top ${bestSellingProducts.length} performing products`
                : "Top performing products in your store"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bestSellingProducts && bestSellingProducts.length > 0 ? (
              <div className="space-y-4">
                {bestSellingProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-none">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.sales?.length || 0} sales
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        ${product.productPrice?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  No sales data available.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="customers">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Customers ({(Array.isArray(customersData) && customersData.length > 0) ? customersData.length : 0})</CardTitle>
                <CardDescription>
                  {(Array.isArray(customersData) && customersData.length > 0) 
                    ? `View the ${customersData.length} most recent customers` 
                    : "Recently active customers"
                  }
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
            {renderDataSection(customersData, "Recent Customers", 
              ({ customers }: { customers: any[] }) => (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Orders</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer._count?.lineOrders || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ), 
              { customers: Array.isArray(customersData) ? customersData : [] }
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export function SummarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard Summary</CardTitle>
        <CardDescription>Loading...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-4 w-4" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-[200px] mb-1" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
              </div>
              <Skeleton className="h-4 w-[60px]" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
