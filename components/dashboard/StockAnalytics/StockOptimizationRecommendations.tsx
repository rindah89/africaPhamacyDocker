"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Package,
  DollarSign,
  Clock,
  Target,
  ArrowRight,
  Star,
  Zap
} from 'lucide-react';
import { StockAnalyticsData, StockAnalyticsSummary } from '@/actions/stock-analytics';
import { formatMoney } from '@/lib/formatMoney';

interface StockOptimizationRecommendationsProps {
  products: StockAnalyticsData[];
  summary: StockAnalyticsSummary;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  category: 'stock' | 'purchasing' | 'sales' | 'cost';
  actionItems: string[];
  products: StockAnalyticsData[];
  estimatedSavings?: number;
  estimatedTimeToImplement?: string;
  icon: React.ReactNode;
}

export default function StockOptimizationRecommendations({ 
  products, 
  summary 
}: StockOptimizationRecommendationsProps) {
  
  const recommendations = useMemo<Recommendation[]>(() => {
    const recs: Recommendation[] = [];
    
    // Critical Stock Shortage Recommendations
    const criticalProducts = products.filter(p => p.currentStock <= p.alertQty);
    if (criticalProducts.length > 0) {
      recs.push({
        id: 'critical-stock',
        title: 'Immediate Restock Required',
        description: `${criticalProducts.length} products are at or below their alert quantities and need immediate attention.`,
        priority: 'high',
        impact: 'high',
        category: 'stock',
        actionItems: [
          'Place emergency orders for critically low products',
          'Contact suppliers for expedited delivery',
          'Consider temporary price increases to manage demand',
          'Review alert thresholds for early warning'
        ],
        products: criticalProducts,
        estimatedSavings: criticalProducts.length * 500, // Estimated lost sales per product
        estimatedTimeToImplement: '1-2 days',
        icon: <AlertTriangle className="h-5 w-5 text-red-600" />
      });
    }
    
    // Overstocked Products Recommendations
    const overstockedProducts = products.filter(p => p.currentStock > p.optimalStock * 1.5);
    if (overstockedProducts.length > 0) {
      const totalOverstockValue = overstockedProducts.reduce((sum, p) => 
        sum + ((p.currentStock - p.optimalStock) * p.productCost), 0
      );
      
      recs.push({
        id: 'reduce-overstock',
        title: 'Reduce Overstocked Inventory',
        description: `${overstockedProducts.length} products are significantly overstocked, tying up capital.`,
        priority: 'medium',
        impact: 'medium',
        category: 'cost',
        actionItems: [
          'Implement promotional campaigns for overstocked items',
          'Negotiate return agreements with suppliers',
          'Consider bundling overstocked items with popular products',
          'Adjust reorder points to prevent future overstocking'
        ],
        products: overstockedProducts,
        estimatedSavings: totalOverstockValue * 0.15, // 15% carrying cost savings
        estimatedTimeToImplement: '2-4 weeks',
        icon: <Package className="h-5 w-5 text-orange-600" />
      });
    }
    
    // High Demand Variability Recommendations
    const highVariabilityProducts = products.filter(p => p.demandVariability > 0.5);
    if (highVariabilityProducts.length > 0) {
      recs.push({
        id: 'demand-variability',
        title: 'Improve Demand Forecasting',
        description: `${highVariabilityProducts.length} products have high demand variability requiring better forecasting.`,
        priority: 'medium',
        impact: 'high',
        category: 'sales',
        actionItems: [
          'Implement more sophisticated forecasting models',
          'Increase safety stock for high-variability items',
          'Monitor seasonal patterns and external factors',
          'Consider supplier partnerships for flexible ordering'
        ],
        products: highVariabilityProducts,
        estimatedTimeToImplement: '4-6 weeks',
        icon: <TrendingUp className="h-5 w-5 text-blue-600" />
      });
    }
    
    // Category A Products Optimization
    const categoryAProducts = products.filter(p => p.abcCategory === 'A');
    const suboptimalCategoryA = categoryAProducts.filter(p => {
      const efficiency = p.optimalStock > 0 ? (p.currentStock / p.optimalStock) : 0;
      return efficiency < 0.8 || efficiency > 1.2;
    });
    
    if (suboptimalCategoryA.length > 0) {
      recs.push({
        id: 'category-a-optimization',
        title: 'Optimize High-Value Products',
        description: `${suboptimalCategoryA.length} Category A products need stock optimization for maximum ROI.`,
        priority: 'high',
        impact: 'high',
        category: 'purchasing',
        actionItems: [
          'Prioritize Category A products in inventory management',
          'Implement just-in-time ordering for high-value items',
          'Establish direct supplier relationships',
          'Monitor Category A products daily'
        ],
        products: suboptimalCategoryA,
        estimatedSavings: suboptimalCategoryA.length * 1000, // Higher impact for Category A
        estimatedTimeToImplement: '1-3 weeks',
        icon: <Star className="h-5 w-5 text-green-600" />
      });
    }
    
    // Declining Sales Trend Recommendations
    const decliningProducts = products.filter(p => p.salesTrend === 'decreasing');
    if (decliningProducts.length > 0) {
      recs.push({
        id: 'declining-sales',
        title: 'Address Declining Sales',
        description: `${decliningProducts.length} products show declining sales trends requiring intervention.`,
        priority: 'medium',
        impact: 'medium',
        category: 'sales',
        actionItems: [
          'Analyze reasons for declining sales',
          'Consider promotional strategies',
          'Review pricing competitiveness',
          'Evaluate product lifecycle and discontinuation'
        ],
        products: decliningProducts,
        estimatedTimeToImplement: '3-6 weeks',
        icon: <TrendingDown className="h-5 w-5 text-red-600" />
      });
    }
    
    // Economic Order Quantity Optimization
    const inefficientEOQ = products.filter(p => {
      const currentOrderPattern = p.currentStock;
      const optimalEOQ = p.economicOrderQuantity;
      return Math.abs(currentOrderPattern - optimalEOQ) > optimalEOQ * 0.3;
    });
    
    if (inefficientEOQ.length > 0) {
      recs.push({
        id: 'eoq-optimization',
        title: 'Optimize Order Quantities',
        description: `${inefficientEOQ.length} products could benefit from optimized order quantities.`,
        priority: 'low',
        impact: 'medium',
        category: 'purchasing',
        actionItems: [
          'Implement EOQ-based ordering system',
          'Negotiate volume discounts with suppliers',
          'Consider storage capacity constraints',
          'Automate reorder point calculations'
        ],
        products: inefficientEOQ,
        estimatedSavings: inefficientEOQ.length * 200, // Ordering cost savings
        estimatedTimeToImplement: '6-8 weeks',
        icon: <Target className="h-5 w-5 text-purple-600" />
      });
    }
    
    // Safety Stock Recommendations
    const insufficientSafetyStock = products.filter(p => p.currentStock < p.safetyStock);
    if (insufficientSafetyStock.length > 0) {
      recs.push({
        id: 'safety-stock',
        title: 'Increase Safety Stock',
        description: `${insufficientSafetyStock.length} products have insufficient safety stock for demand variability.`,
        priority: 'medium',
        impact: 'medium',
        category: 'stock',
        actionItems: [
          'Increase safety stock levels for volatile products',
          'Review supplier lead times and reliability',
          'Consider alternative suppliers for critical items',
          'Implement buffer stock monitoring'
        ],
        products: insufficientSafetyStock,
        estimatedTimeToImplement: '2-3 weeks',
        icon: <CheckCircle className="h-5 w-5 text-green-600" />
      });
    }
    
    return recs.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [products, summary]);
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-purple-100 text-purple-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'stock': return <Package className="h-4 w-4" />;
      case 'purchasing': return <ShoppingCart className="h-4 w-4" />;
      case 'sales': return <TrendingUp className="h-4 w-4" />;
      case 'cost': return <DollarSign className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="space-y-6">
      
      {/* Summary Alert */}
      <Alert>
        <Zap className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>
              {recommendations.length} optimization opportunities identified with potential savings of{' '}
              <strong>
                {formatMoney(recommendations.reduce((sum, r) => sum + (r.estimatedSavings || 0), 0))}
              </strong>
            </span>
            <Badge variant="outline" className="bg-blue-50">
              {recommendations.filter(r => r.priority === 'high').length} High Priority
            </Badge>
          </div>
        </AlertDescription>
      </Alert>
      
      {/* Recommendations Grid */}
      <div className="grid gap-6">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {rec.icon}
                  <div>
                    <CardTitle className="text-lg">{rec.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                    {rec.priority.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className={getImpactColor(rec.impact)}>
                    {rec.impact.toUpperCase()} IMPACT
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Action Items */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Action Items
                  </h4>
                  <ul className="space-y-2">
                    {rec.actionItems.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Details and Metrics */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <div className="flex items-center space-x-1 text-sm font-medium">
                        {getCategoryIcon(rec.category)}
                        <span className="capitalize">{rec.category}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Products Affected</p>
                      <p className="text-sm font-medium">{rec.products.length}</p>
                    </div>
                  </div>
                  
                  {rec.estimatedSavings && (
                    <div>
                      <p className="text-sm text-gray-500">Estimated Savings</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatMoney(rec.estimatedSavings)}
                      </p>
                    </div>
                  )}
                  
                  {rec.estimatedTimeToImplement && (
                    <div>
                      <p className="text-sm text-gray-500">Implementation Time</p>
                      <div className="flex items-center space-x-1 text-sm font-medium">
                        <Clock className="h-3 w-3" />
                        <span>{rec.estimatedTimeToImplement}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Affected Products Preview */}
              {rec.products.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">
                    Top Affected Products ({Math.min(5, rec.products.length)} of {rec.products.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {rec.products.slice(0, 5).map((product) => (
                      <Badge key={product.productId} variant="outline" className="text-xs">
                        {product.productName}
                      </Badge>
                    ))}
                    {rec.products.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{rec.products.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* No Recommendations */}
      {recommendations.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Great Job!</h3>
            <p className="text-gray-600">
              Your inventory is well-optimized. No major recommendations at this time.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 