"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  ScatterChart,
  Scatter,
  AreaChart,
  Area
} from 'recharts';
import { StockAnalyticsData, StockAnalyticsSummary } from '@/actions/stock-analytics';
import { formatMoney } from '@/lib/formatMoney';
import { TrendingUp, TrendingDown, Package, AlertTriangle } from 'lucide-react';

interface StockAnalyticsChartsProps {
  products: StockAnalyticsData[];
  summary: StockAnalyticsSummary;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function StockAnalyticsCharts({ products, summary }: StockAnalyticsChartsProps) {
  
  // Stock Efficiency Distribution
  const stockEfficiencyData = useMemo(() => {
    const ranges = [
      { name: 'Overstocked (>150%)', range: [1.5, Infinity], color: '#FF8042' },
      { name: 'Well Stocked (100-150%)', range: [1, 1.5], color: '#00C49F' },
      { name: 'Adequate (75-100%)', range: [0.75, 1], color: '#FFBB28' },
      { name: 'Understocked (<75%)', range: [0, 0.75], color: '#FF4444' }
    ];
    
    return ranges.map(range => ({
      name: range.name,
      value: products.filter(p => {
        const efficiency = p.optimalStock > 0 ? (p.currentStock / p.optimalStock) : 0;
        return efficiency >= range.range[0] && efficiency < range.range[1];
      }).length,
      color: range.color
    }));
  }, [products]);

  // ABC Category Distribution
  const abcCategoryData = useMemo(() => {
    const categories = ['A', 'B', 'C'];
    return categories.map(category => ({
      name: `Category ${category}`,
      value: products.filter(p => p.abcCategory === category).length,
      revenue: products
        .filter(p => p.abcCategory === category)
        .reduce((sum, p) => sum + p.monthlySales.reduce((monthSum, month) => monthSum + month.revenue, 0), 0)
    }));
  }, [products]);

  // Sales Trend Distribution
  const salesTrendData = useMemo(() => {
    const trends = ['increasing', 'stable', 'decreasing'];
    return trends.map(trend => ({
      name: trend.charAt(0).toUpperCase() + trend.slice(1),
      value: products.filter(p => p.salesTrend === trend).length,
      color: trend === 'increasing' ? '#00C49F' : trend === 'decreasing' ? '#FF8042' : '#FFBB28'
    }));
  }, [products]);

  // Stock vs Sales Correlation
  const stockSalesCorrelation = useMemo(() => {
    return products.slice(0, 50).map(product => ({
      name: product.productName,
      currentStock: product.currentStock,
      optimalStock: product.optimalStock,
      totalSales: product.totalSales,
      averageMonthlySales: product.averageMonthlySales,
      efficiency: product.optimalStock > 0 ? (product.currentStock / product.optimalStock) * 100 : 0,
      category: product.abcCategory
    }));
  }, [products]);

  // Monthly Sales Trends (aggregated)
  const monthlyTrendsData = useMemo(() => {
    const monthlyData: { [key: string]: { sales: number, revenue: number } } = {};
    
    products.forEach(product => {
      product.monthlySales.forEach(month => {
        if (!monthlyData[month.month]) {
          monthlyData[month.month] = { sales: 0, revenue: 0 };
        }
        monthlyData[month.month].sales += month.sales;
        monthlyData[month.month].revenue += month.revenue;
      });
    });
    
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      sales: data.sales,
      revenue: data.revenue
    }));
  }, [products]);

  // Top 10 Products by Sales
  const topProductsBySales = useMemo(() => {
    return products
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10)
      .map(product => ({
        name: product.productName,
        sales: product.totalSales,
        currentStock: product.currentStock,
        optimalStock: product.optimalStock,
        category: product.abcCategory
      }));
  }, [products]);

  // Demand Variability vs Stock Efficiency
  const demandVariabilityData = useMemo(() => {
    return products.map(product => ({
      name: product.productName,
      demandVariability: product.demandVariability,
      stockEfficiency: product.optimalStock > 0 ? (product.currentStock / product.optimalStock) * 100 : 0,
      totalSales: product.totalSales,
      category: product.abcCategory
    }));
  }, [products]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Stock Efficiency Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Stock Efficiency Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stockEfficiencyData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stockEfficiencyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ABC Category Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>ABC Category Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={abcCategoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Products" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Sales Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>6-Month Sales Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyTrendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
                name="Total Sales"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sales Trend Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingDown className="h-5 w-5" />
            <span>Sales Trend Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={salesTrendData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {salesTrendData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top 10 Products by Sales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Top 10 Products by Sales</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProductsBySales} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="sales" fill="#0088FE" name="Sales" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Stock vs Optimal Stock Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Stock vs Optimal Stock</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={stockSalesCorrelation}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="currentStock" 
                name="Current Stock"
                label={{ value: 'Current Stock', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                type="number" 
                dataKey="optimalStock" 
                name="Optimal Stock"
                label={{ value: 'Optimal Stock', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter 
                name="Products" 
                data={stockSalesCorrelation} 
                fill="#8884d8"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Metrics Summary */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Key Analytics Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {summary.stockEfficiency.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Stock Efficiency</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {summary.totalProducts}
              </div>
              <div className="text-sm text-gray-600">Products Analyzed</div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {summary.understockedProducts}
              </div>
              <div className="text-sm text-gray-600">Understocked</div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {summary.overstockedProducts}
              </div>
              <div className="text-sm text-gray-600">Overstocked</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 