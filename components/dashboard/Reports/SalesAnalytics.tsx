"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/formatMoney";
import { TrendingUp, TrendingDown, Minus, DollarSign, ShoppingCart, Package, Target } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

interface SalesAnalyticsProps {
  sales: any[];
  totals: {
    totalOrders: number;
    totalQuantity: number;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
  };
  dailySales: any[];
  compactView?: boolean;
}

interface MetricCardProps {
  title: string;
  value: number;
  previousValue?: number;
  formatValue?: (value: number) => string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  compactView?: boolean;
}

function MetricCard({ 
  title, 
  value, 
  previousValue, 
  formatValue = (v) => v.toLocaleString(), 
  icon, 
  trend,
  compactView = false 
}: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const changePercentage = previousValue && previousValue > 0 
    ? ((value - previousValue) / previousValue * 100).toFixed(1)
    : null;

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${compactView ? 'pb-1' : 'pb-2'}`}>
        <CardTitle className={`font-medium ${compactView ? 'text-xs' : 'text-sm'}`}>
          {title}
        </CardTitle>
        <div className="text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`font-bold ${compactView ? 'text-lg' : 'text-2xl'}`}>
          {formatValue(value)}
        </div>
        {changePercentage && (
          <div className={`flex items-center ${compactView ? 'text-xs' : 'text-sm'} ${getTrendColor()} mt-1`}>
            {getTrendIcon()}
            <span className="ml-1">
              {changePercentage}% from previous period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SalesAnalytics({ 
  sales, 
  totals, 
  dailySales, 
  compactView = false 
}: SalesAnalyticsProps) {
  // Calculate additional metrics
  const analytics = useMemo(() => {
    const avgOrderValue = totals.totalOrders > 0 ? totals.totalRevenue / totals.totalOrders : 0;
    const profitMargin = totals.totalRevenue > 0 ? (totals.totalProfit / totals.totalRevenue) * 100 : 0;
    const avgItemsPerOrder = totals.totalOrders > 0 ? totals.totalQuantity / totals.totalOrders : 0;

    return {
      avgOrderValue,
      profitMargin,
      avgItemsPerOrder,
    };
  }, [totals]);

  // Format daily sales data for enhanced charts
  const chartData = useMemo(() => {
    return dailySales.map(day => ({
      ...day,
      date: new Date(day.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      profitMargin: day.revenue > 0 ? ((day.profit / day.revenue) * 100) : 0,
      avgOrderValue: day.orders > 0 ? (day.revenue / day.orders) : 0,
    }));
  }, [dailySales]);

  // Top selling products/categories
  const topProducts = useMemo(() => {
    const productSales = sales.reduce((acc, sale) => {
      const key = sale.productName;
      if (!acc[key]) {
        acc[key] = {
          name: key,
          quantity: 0,
          revenue: 0,
          orders: new Set()
        };
      }
      acc[key].quantity += sale.quantity;
      acc[key].revenue += sale.revenue;
      acc[key].orders.add(sale.orderId);
      return acc;
    }, {} as Record<string, any>);

    return Object.values(productSales)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [sales]);

  // Category distribution
  const categoryData = useMemo(() => {
    const categories = sales.reduce((acc, sale) => {
      const category = sale.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { name: category, value: 0, count: 0 };
      }
      acc[category].value += sale.revenue;
      acc[category].count += sale.quantity;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(categories).slice(0, 6);
  }, [sales]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className={`grid gap-4 ${compactView ? 'md:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
        <MetricCard
          title="Average Order Value"
          value={analytics.avgOrderValue}
          formatValue={formatMoney}
          icon={<DollarSign className="h-4 w-4" />}
          compactView={compactView}
        />
        <MetricCard
          title="Profit Margin"
          value={analytics.profitMargin}
          formatValue={(v) => `${v.toFixed(1)}%`}
          icon={<Target className="h-4 w-4" />}
          trend={analytics.profitMargin > 20 ? 'up' : analytics.profitMargin < 10 ? 'down' : 'neutral'}
          compactView={compactView}
        />
        <MetricCard
          title="Items per Order"
          value={analytics.avgItemsPerOrder}
          formatValue={(v) => v.toFixed(1)}
          icon={<Package className="h-4 w-4" />}
          compactView={compactView}
        />
        <MetricCard
          title="Conversion Rate"
          value={85.5} // This would be calculated from actual data
          formatValue={(v) => `${v.toFixed(1)}%`}
          icon={<ShoppingCart className="h-4 w-4" />}
          trend="up"
          compactView={compactView}
        />
      </div>

      {/* Enhanced Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profit Margin Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Profit Margin Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Profit Margin']}
                  />
                  <Area
                    type="monotone"
                    dataKey="profitMargin"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Average Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [formatMoney(value), 'Avg Order Value']}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgOrderValue"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    dot={{ fill: '#82ca9d', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products and Category Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product: any, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.quantity} items sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatMoney(product.revenue)}</p>
                    <Badge variant="outline" className="text-xs">
                      {product.orders.size} orders
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatMoney(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 