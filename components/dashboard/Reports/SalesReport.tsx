"use client";

import React, { useState, useMemo, useEffect } from "react";
import { columns } from "@/app/(back-office)/dashboard/reports/sales/columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/formatMoney";
import DataTable from "@/components/DataTableComponents/DataTable";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  BarChart
} from 'recharts';

interface SalesReportProps {
  sales: any[];
  totals: {
    totalOrders: number;
    totalQuantity: number;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
  };
  dailySales: any[];
}

export default function SalesReport({ sales, totals, dailySales }: SalesReportProps) {
  console.log('SalesReport component rendering with:', {
    salesCount: sales?.length,
    hasTotals: !!totals,
    dailySalesCount: dailySales?.length
  });

  useEffect(() => {
    console.log('SalesReport mounted with data:', {
      sales: sales?.slice(0, 1), // Log first item as sample
      totals,
      dailySales: dailySales?.slice(0, 1) // Log first item as sample
    });
  }, [sales, totals, dailySales]);

  const [selectedSales, setSelectedSales] = useState<any[]>([]);
  
  // Sort sales by date (memoized)
  const sortedSales = useMemo(() => {
    console.log('Sorting sales data...');
    const sorted = [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    console.log('Sorted sales count:', sorted.length);
    return sorted;
  }, [sales]);

  // Calculate totals based on selected sales or use provided totals
  const displayTotals = useMemo(() => {
    console.log('Calculating display totals with selected sales:', selectedSales.length);
    
    if (selectedSales.length === 0) {
      return totals;
    }

    const selectedOrderIds = new Set(selectedSales.map(sale => sale.orderId));
    const calculatedTotals = {
      totalOrders: selectedOrderIds.size,
      totalQuantity: selectedSales.reduce((sum, sale) => sum + sale.quantity, 0),
      totalRevenue: selectedSales.reduce((sum, sale) => sum + sale.revenue, 0),
      totalCost: selectedSales.reduce((sum, sale) => sum + sale.cost, 0),
      totalProfit: selectedSales.reduce((sum, sale) => sum + sale.profit, 0)
    };
    
    console.log('Calculated totals for selection:', calculatedTotals);
    return calculatedTotals;
  }, [selectedSales, totals]);

  // Format daily sales data for the charts
  const chartData = useMemo(() => {
    console.log('Formatting chart data from daily sales:', dailySales.length);
    const formatted = dailySales.map(day => ({
      ...day,
      date: new Date(day.date).toLocaleDateString(),
    }));
    console.log('Formatted chart data entries:', formatted.length);
    return formatted;
  }, [dailySales]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayTotals.totalOrders.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayTotals.totalQuantity.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(displayTotals.totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(displayTotals.totalCost)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(displayTotals.totalProfit)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Daily Revenue & Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => formatMoney(value)}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8884d8" 
                    name="Revenue"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#82ca9d" 
                    name="Profit"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader>
            <CardTitle>Daily Orders & Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="orders" 
                    fill="#8884d8" 
                    name="Orders"
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="quantity" 
                    fill="#82ca9d" 
                    name="Items Sold"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between py-4">
          <h2 className="text-2xl font-semibold">Sales Details</h2>
        </div>
        <DataTable 
          columns={columns} 
          data={sortedSales}
          initialSorting={[{ id: "date", desc: true }]}
          onSelectionChange={setSelectedSales}
          hideFilters={true}
        />
      </div>
    </div>
  );
} 