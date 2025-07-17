"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  ArrowUpDown
} from 'lucide-react';
import { StockAnalyticsData } from '@/actions/stock-analytics';
import { formatMoney } from '@/lib/formatMoney';
import { cn } from '@/lib/utils';

interface StockAnalyticsTableProps {
  products: StockAnalyticsData[];
  isLoading?: boolean;
}

export default function StockAnalyticsTable({ products, isLoading }: StockAnalyticsTableProps) {
  const [sortField, setSortField] = useState<keyof StockAnalyticsData>('optimalStock');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedProduct, setSelectedProduct] = useState<StockAnalyticsData | null>(null);

  const handleSort = (field: keyof StockAnalyticsData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });

  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStockStatus = (current: number, optimal: number, alert: number) => {
    if (current <= alert) {
      return { 
        status: 'critical', 
        icon: <XCircle className="h-4 w-4 text-red-600" />, 
        color: 'text-red-600' 
      };
    }
    
    const efficiency = optimal > 0 ? (current / optimal) : 0;
    
    if (efficiency > 1.5) {
      return { 
        status: 'overstocked', 
        icon: <AlertTriangle className="h-4 w-4 text-orange-600" />, 
        color: 'text-orange-600' 
      };
    }
    
    if (efficiency < 0.75) {
      return { 
        status: 'understocked', 
        icon: <AlertTriangle className="h-4 w-4 text-yellow-600" />, 
        color: 'text-yellow-600' 
      };
    }
    
    return { 
      status: 'optimal', 
      icon: <CheckCircle className="h-4 w-4 text-green-600" />, 
      color: 'text-green-600' 
    };
  };

  const getABCBadgeColor = (category: 'A' | 'B' | 'C') => {
    switch (category) {
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B':
        return 'bg-yellow-100 text-yellow-800';
      case 'C':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const SortableHeader = ({ field, children }: { field: keyof StockAnalyticsData; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <ArrowUpDown className="h-3 w-3 text-gray-400" />
      </div>
    </TableHead>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading stock analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Stock Analytics Overview</span>
          <Badge variant="outline">{products.length} Products</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader field="productName">Product</SortableHeader>
                <SortableHeader field="currentStock">Current Stock</SortableHeader>
                <SortableHeader field="optimalStock">Optimal Stock</SortableHeader>
                <SortableHeader field="safetyStock">Safety Stock</SortableHeader>
                <SortableHeader field="reorderPoint">Reorder Point</SortableHeader>
                <SortableHeader field="totalSales">6M Sales</SortableHeader>
                <SortableHeader field="salesTrend">Trend</SortableHeader>
                <SortableHeader field="abcCategory">ABC</SortableHeader>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map((product) => {
                const stockStatus = getStockStatus(
                  product.currentStock, 
                  product.optimalStock, 
                  product.alertQty
                );
                
                return (
                  <TableRow key={product.productId} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{product.productName}</div>
                        <div className="text-sm text-gray-500">{product.productCode}</div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className={cn("font-medium", stockStatus.color)}>
                          {product.currentStock}
                        </span>
                        {stockStatus.icon}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <span className="font-medium text-blue-600">
                        {product.optimalStock}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-gray-600">
                        {product.safetyStock}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-gray-600">
                        {product.reorderPoint}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.totalSales}</div>
                        <div className="text-sm text-gray-500">
                          {product.averageMonthlySales.toFixed(1)}/month
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(product.salesTrend)}
                        <span className="text-sm capitalize">{product.salesTrend}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={getABCBadgeColor(product.abcCategory)}
                      >
                        {product.abcCategory}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {stockStatus.icon}
                        <span className={cn("text-sm capitalize", stockStatus.color)}>
                          {stockStatus.status}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {sortedProducts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No products found matching the current filters.
          </div>
        )}
      </CardContent>
      
      {/* Product Detail Modal/Drawer could go here */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedProduct.productName}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProduct(null)}
              >
                ×
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Product Code</label>
                <p className="text-sm">{selectedProduct.productCode}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">ABC Category</label>
                <p className="text-sm">{selectedProduct.abcCategory}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Current Stock</label>
                <p className="text-sm">{selectedProduct.currentStock}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Optimal Stock</label>
                <p className="text-sm">{selectedProduct.optimalStock}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Demand Variability</label>
                <p className="text-sm">{selectedProduct.demandVariability.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Sales Trend</label>
                <p className="text-sm capitalize">{selectedProduct.salesTrend}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-500">Monthly Sales (Last 6 Months)</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {selectedProduct.monthlySales.map((month, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                    <div className="font-medium">{month.month}</div>
                    <div className="text-gray-600">{month.sales} units</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Recommendations</label>
              <ul className="mt-2 space-y-1">
                {selectedProduct.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm bg-blue-50 p-2 rounded">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
} 