"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Download, Filter, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getStockAnalytics } from '@/actions/stock-analytics';
import StockAnalyticsTable from './StockAnalyticsTable';
import StockAnalyticsCharts from './StockAnalyticsCharts';
import StockOptimizationRecommendations from './StockOptimizationRecommendations';
import ABCAnalysisSection from './ABCAnalysisSection';
import CriticalStockAlerts from './CriticalStockAlerts';
import { formatMoney } from '@/lib/formatMoney';

export default function StockAnalyticsContent() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [filterCategory, setFilterCategory] = useState<'all' | 'A' | 'B' | 'C'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'sales' | 'efficiency'>('efficiency');
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const {
    data: analyticsData,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['stock-analytics', page, limit, searchQuery],
    queryFn: () => getStockAnalytics(page, limit, searchQuery),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    if (!analyticsData?.products) return;
    
    const csvData = analyticsData.products.map(product => ({
      'Product Name': product.productName,
      'Product Code': product.productCode,
      'Current Stock': product.currentStock,
      'Optimal Stock': product.optimalStock,
      'Safety Stock': product.safetyStock,
      'Reorder Point': product.reorderPoint,
      'ABC Category': product.abcCategory,
      'Sales Trend': product.salesTrend,
      'Total Sales (6M)': product.totalSales,
      'Avg Monthly Sales': product.averageMonthlySales,
      'Demand Variability': product.demandVariability,
      'Recommendations': product.recommendations.join('; ')
    }));
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSearch = () => {
    setPage(1);
    setSearchQuery(searchInput.trim());
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const filteredProducts = analyticsData?.products?.filter(product => {
    if (filterCategory === 'all') return true;
    return product.abcCategory === filterCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.productName.localeCompare(b.productName);
      case 'stock':
        return b.currentStock - a.currentStock;
      case 'sales':
        return b.totalSales - a.totalSales;
      case 'efficiency':
        const aEfficiency = a.optimalStock > 0 ? (a.currentStock / a.optimalStock) : 0;
        const bEfficiency = b.optimalStock > 0 ? (b.currentStock / b.optimalStock) : 0;
        return Math.abs(1 - bEfficiency) - Math.abs(1 - aEfficiency);
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Analyzing stock data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load stock analytics: {error.message}
          <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-2">
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!analyticsData?.success || !analyticsData.products) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          No stock analytics data available. Please check your product and sales data.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.summary.stockEfficiency.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall inventory optimization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Analyzed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.summary.totalProducts}
            </div>
            <p className="text-xs text-muted-foreground">
              Total products in analysis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {analyticsData.summary.understockedProducts}
            </div>
            <p className="text-xs text-muted-foreground">
              Products needing attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimal Stock Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatMoney(analyticsData.summary.totalOptimalStock * 100)} {/* Assuming avg cost of 100 per unit */}
            </div>
            <p className="text-xs text-muted-foreground">
              Recommended inventory value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by name or code"
            className="px-3 py-1 border rounded-md text-sm"
            aria-label="Search products"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleSearch}
          >
            Search
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="all">All Categories</option>
            <option value="A">Category A</option>
            <option value="B">Category B</option>
            <option value="C">Category C</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="efficiency">Sort by Efficiency</option>
            <option value="name">Sort by Name</option>
            <option value="stock">Sort by Stock</option>
            <option value="sales">Sort by Sales</option>
          </select>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="abc-analysis">ABC Analysis</TabsTrigger>
          <TabsTrigger value="alerts">Critical Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <StockAnalyticsTable 
            products={filteredProducts || []}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <StockAnalyticsCharts 
            products={filteredProducts || []}
            summary={analyticsData.summary}
          />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <StockOptimizationRecommendations 
            products={filteredProducts || []}
            summary={analyticsData.summary}
          />
        </TabsContent>

        <TabsContent value="abc-analysis" className="space-y-4">
          <ABCAnalysisSection 
            products={analyticsData.products}
          />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <CriticalStockAlerts 
            products={analyticsData.products}
          />
        </TabsContent>
      </Tabs>

      {analyticsData.pagination && (
        <div className="flex items-center justify-center gap-4 py-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!analyticsData.pagination.hasPreviousPage}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {analyticsData.pagination.currentPage} of {analyticsData.pagination.totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={!analyticsData.pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
} 