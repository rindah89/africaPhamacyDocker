"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Star, 
  Circle, 
  Triangle, 
  TrendingUp, 
  Package, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3
} from 'lucide-react';
import { StockAnalyticsData } from '@/actions/stock-analytics';
import { formatMoney } from '@/lib/formatMoney';

interface ABCAnalysisSectionProps {
  products: StockAnalyticsData[];
}

interface ABCCategoryAnalysis {
  category: 'A' | 'B' | 'C';
  products: StockAnalyticsData[];
  totalProducts: number;
  totalRevenue: number;
  averageStock: number;
  averageOptimalStock: number;
  stockEfficiency: number;
  revenuePercentage: number;
  productPercentage: number;
  recommendations: string[];
}

const COLORS = {
  A: '#22c55e', // Green
  B: '#f59e0b', // Yellow
  C: '#6b7280'  // Gray
};

export default function ABCAnalysisSection({ products }: ABCAnalysisSectionProps) {
  
  const abcAnalysis = useMemo<ABCCategoryAnalysis[]>(() => {
    const totalRevenue = products.reduce((sum, p) => 
      sum + p.monthlySales.reduce((monthSum, month) => monthSum + month.revenue, 0), 0
    );
    
    const categories: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];
    
    return categories.map(category => {
      const categoryProducts = products.filter(p => p.abcCategory === category);
      const categoryRevenue = categoryProducts.reduce((sum, p) => 
        sum + p.monthlySales.reduce((monthSum, month) => monthSum + month.revenue, 0), 0
      );
      
      const totalStock = categoryProducts.reduce((sum, p) => sum + p.currentStock, 0);
      const totalOptimalStock = categoryProducts.reduce((sum, p) => sum + p.optimalStock, 0);
      const stockEfficiency = totalOptimalStock > 0 ? (totalStock / totalOptimalStock) * 100 : 0;
      
      // Generate category-specific recommendations
      const recommendations = generateCategoryRecommendations(category, categoryProducts, stockEfficiency);
      
      return {
        category,
        products: categoryProducts,
        totalProducts: categoryProducts.length,
        totalRevenue: categoryRevenue,
        averageStock: categoryProducts.length > 0 ? totalStock / categoryProducts.length : 0,
        averageOptimalStock: categoryProducts.length > 0 ? totalOptimalStock / categoryProducts.length : 0,
        stockEfficiency,
        revenuePercentage: totalRevenue > 0 ? (categoryRevenue / totalRevenue) * 100 : 0,
        productPercentage: products.length > 0 ? (categoryProducts.length / products.length) * 100 : 0,
        recommendations
      };
    });
  }, [products]);
  
  const generateCategoryRecommendations = (
    category: 'A' | 'B' | 'C', 
    categoryProducts: StockAnalyticsData[], 
    stockEfficiency: number
  ): string[] => {
    const recommendations: string[] = [];
    
    switch (category) {
      case 'A':
        recommendations.push('Monitor daily - these are your highest value products');
        recommendations.push('Maintain optimal stock levels to prevent stockouts');
        recommendations.push('Consider safety stock increases for demand variability');
        recommendations.push('Establish direct supplier relationships for reliability');
        
        if (stockEfficiency > 120) {
          recommendations.push('Consider reducing stock levels to free up capital');
        } else if (stockEfficiency < 80) {
          recommendations.push('Increase stock levels to prevent lost sales');
        }
        
        const highVariabilityA = categoryProducts.filter(p => p.demandVariability > 0.5);
        if (highVariabilityA.length > 0) {
          recommendations.push(`${highVariabilityA.length} products have high demand variability - implement advanced forecasting`);
        }
        break;
        
      case 'B':
        recommendations.push('Review weekly - moderate value products requiring attention');
        recommendations.push('Balance inventory levels with carrying costs');
        recommendations.push('Consider automated reorder systems');
        recommendations.push('Monitor for changes in demand patterns');
        
        if (stockEfficiency > 150) {
          recommendations.push('Overstock issues - consider promotional strategies');
        } else if (stockEfficiency < 75) {
          recommendations.push('Understock risk - review reorder points');
        }
        
        const decliningB = categoryProducts.filter(p => p.salesTrend === 'decreasing');
        if (decliningB.length > 0) {
          recommendations.push(`${decliningB.length} products show declining trends - evaluate discontinuation`);
        }
        break;
        
      case 'C':
        recommendations.push('Review monthly - lower value products');
        recommendations.push('Minimize carrying costs while maintaining availability');
        recommendations.push('Consider consolidating suppliers for better terms');
        recommendations.push('Evaluate discontinuation of slow-moving items');
        
        if (stockEfficiency > 200) {
          recommendations.push('Significant overstock - aggressive clearance needed');
        }
        
        const noSalesC = categoryProducts.filter(p => p.totalSales === 0);
        if (noSalesC.length > 0) {
          recommendations.push(`${noSalesC.length} products have no sales - consider discontinuation`);
        }
        break;
    }
    
    return recommendations;
  };
  
  const chartData = abcAnalysis.map(analysis => ({
    category: `Category ${analysis.category}`,
    products: analysis.totalProducts,
    revenue: analysis.totalRevenue,
    revenuePercentage: analysis.revenuePercentage,
    productPercentage: analysis.productPercentage,
    stockEfficiency: analysis.stockEfficiency
  }));
  
  const getCategoryIcon = (category: 'A' | 'B' | 'C') => {
    switch (category) {
      case 'A': return <Star className="h-5 w-5 text-green-600" />;
      case 'B': return <Circle className="h-5 w-5 text-yellow-600" />;
      case 'C': return <Triangle className="h-5 w-5 text-gray-600" />;
    }
  };
  
  const getCategoryDescription = (category: 'A' | 'B' | 'C') => {
    switch (category) {
      case 'A': return 'High-value products requiring tight control and frequent monitoring';
      case 'B': return 'Moderate-value products with balanced control measures';
      case 'C': return 'Lower-value products with minimal control requirements';
    }
  };
  
  const getStockStatusColor = (efficiency: number) => {
    if (efficiency > 150) return 'text-red-600';
    if (efficiency > 120) return 'text-orange-600';
    if (efficiency < 75) return 'text-yellow-600';
    return 'text-green-600';
  };
  
  const getStockStatusIcon = (efficiency: number) => {
    if (efficiency > 150) return <AlertTriangle className="h-4 w-4 text-red-600" />;
    if (efficiency > 120) return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    if (efficiency < 75) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };
  
  return (
    <div className="space-y-6">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {abcAnalysis.map((analysis) => (
          <Card key={analysis.category} className="relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 w-1 h-full"
              style={{ backgroundColor: COLORS[analysis.category] }}
            />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(analysis.category)}
                  <CardTitle className="text-lg">Category {analysis.category}</CardTitle>
                </div>
                <Badge 
                  variant="outline" 
                  style={{ 
                    backgroundColor: `${COLORS[analysis.category]}20`,
                    color: COLORS[analysis.category]
                  }}
                >
                  {analysis.totalProducts} Products
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Revenue Share</p>
                    <p className="font-semibold">{analysis.revenuePercentage.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Product Share</p>
                    <p className="font-semibold">{analysis.productPercentage.toFixed(1)}%</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-500 text-sm">Stock Efficiency</p>
                  <div className="flex items-center space-x-2">
                    {getStockStatusIcon(analysis.stockEfficiency)}
                    <span className={`font-semibold ${getStockStatusColor(analysis.stockEfficiency)}`}>
                      {analysis.stockEfficiency.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-500 text-sm">Total Revenue</p>
                  <p className="font-semibold">{formatMoney(analysis.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Revenue Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, revenuePercentage }) => `${category}: ${revenuePercentage.toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="revenuePercentage"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.category.split(' ')[1] as 'A' | 'B' | 'C']} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Revenue Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Stock Efficiency Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Stock Efficiency by Category</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Stock Efficiency']} />
                <Bar dataKey="stockEfficiency" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="A" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="A" className="flex items-center space-x-2">
            <Star className="h-4 w-4" />
            <span>Category A</span>
          </TabsTrigger>
          <TabsTrigger value="B" className="flex items-center space-x-2">
            <Circle className="h-4 w-4" />
            <span>Category B</span>
          </TabsTrigger>
          <TabsTrigger value="C" className="flex items-center space-x-2">
            <Triangle className="h-4 w-4" />
            <span>Category C</span>
          </TabsTrigger>
        </TabsList>
        
        {abcAnalysis.map((analysis) => (
          <TabsContent key={analysis.category} value={analysis.category} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getCategoryIcon(analysis.category)}
                  <span>Category {analysis.category} Analysis</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {getCategoryDescription(analysis.category)}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {analysis.totalProducts}
                      </div>
                      <div className="text-sm text-gray-600">Products</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {formatMoney(analysis.totalRevenue)}
                      </div>
                      <div className="text-sm text-gray-600">Total Revenue</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        {analysis.averageStock.toFixed(0)}
                      </div>
                      <div className="text-sm text-gray-600">Avg Stock</div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">
                        {analysis.stockEfficiency.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Efficiency</div>
                    </div>
                  </div>
                  
                  {/* Recommendations */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      Recommendations
                    </h4>
                    <div className="space-y-2">
                      {analysis.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start space-x-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Top Products Table */}
                  <div>
                    <h4 className="font-medium mb-3">Top Products in Category {analysis.category}</h4>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Optimal</TableHead>
                            <TableHead>6M Sales</TableHead>
                            <TableHead>Revenue</TableHead>
                            <TableHead>Trend</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analysis.products.slice(0, 5).map((product) => (
                            <TableRow key={product.productId}>
                              <TableCell className="font-medium">
                                <div>
                                  <div className="font-medium">{product.productName}</div>
                                  <div className="text-sm text-gray-500">{product.productCode}</div>
                                </div>
                              </TableCell>
                              <TableCell>{product.currentStock}</TableCell>
                              <TableCell>{product.optimalStock}</TableCell>
                              <TableCell>{product.totalSales}</TableCell>
                              <TableCell>
                                {formatMoney(product.monthlySales.reduce((sum, month) => sum + month.revenue, 0))}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={
                                    product.salesTrend === 'increasing' ? 'bg-green-100 text-green-800' :
                                    product.salesTrend === 'decreasing' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }
                                >
                                  {product.salesTrend}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {analysis.products.length > 5 && (
                      <p className="text-sm text-gray-500 mt-2">
                        Showing top 5 of {analysis.products.length} products
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 