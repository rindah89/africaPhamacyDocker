import React from 'react';
import { Metadata } from 'next';
import StockAnalyticsContent from '@/components/dashboard/StockAnalytics/StockAnalyticsContent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Package, AlertTriangle } from 'lucide-react';
import AuthorizePageWrapper from '@/components/dashboard/Auth/AuthorizePageWrapper';
import { permissionsObj } from '@/config/permissions';

export const metadata: Metadata = {
  title: 'Stock Analytics | Dashboard',
  description: 'Comprehensive stock optimization analytics with 6-month sales data and optimal stock quantity recommendations',
};

export default function StockAnalyticsPage() {
  return (
    <AuthorizePageWrapper requiredPermission={permissionsObj.canViewStockAnalytics}>
      <div className="flex flex-col space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stock Analytics</h1>
            <p className="text-muted-foreground">
              AI-powered stock optimization with 6-month sales analysis and demand forecasting
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Advanced Analytics</span>
          </div>
        </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Loading...</div>
            <p className="text-xs text-muted-foreground">
              Overall inventory optimization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Analyzed</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Loading...</div>
            <p className="text-xs text-muted-foreground">
              Total products in analysis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Loading...</div>
            <p className="text-xs text-muted-foreground">
              Products needing attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimal Stock Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Loading...</div>
            <p className="text-xs text-muted-foreground">
              Recommended inventory value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <StockAnalyticsContent />
    </div>
    </AuthorizePageWrapper>
  );
} 