"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  AlertTriangle, 
  AlertCircle, 
  XCircle, 
  TrendingDown, 
  Clock, 
  Package, 
  DollarSign,
  Zap,
  Bell,
  CheckCircle,
  Target,
  ArrowRight,
  Mail,
  Phone,
  ShoppingCart
} from 'lucide-react';
import { StockAnalyticsData } from '@/actions/stock-analytics';
import { formatMoney } from '@/lib/formatMoney';

interface CriticalStockAlertsProps {
  products: StockAnalyticsData[];
}

interface StockAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  product: StockAnalyticsData;
  actionRequired: string;
  timeframe: string;
  estimatedImpact: string;
  icon: React.ReactNode;
}

export default function CriticalStockAlerts({ products }: CriticalStockAlertsProps) {
  
  const alerts = useMemo<StockAlert[]>(() => {
    const alertsList: StockAlert[] = [];
    
    products.forEach(product => {
      const stockEfficiency = product.optimalStock > 0 ? (product.currentStock / product.optimalStock) : 0;
      
      // Critical stockout alerts
      if (product.currentStock <= product.alertQty) {
        alertsList.push({
          id: `critical-${product.productId}`,
          type: 'critical',
          severity: 'high',
          title: 'Critical Stock Level',
          description: `${product.productName} is at or below alert quantity`,
          product,
          actionRequired: 'Immediate reorder required',
          timeframe: '24-48 hours',
          estimatedImpact: 'Potential stockout and lost sales',
          icon: <XCircle className="h-5 w-5 text-red-600" />
        });
      }
      
      // Below reorder point alerts
      else if (product.currentStock <= product.reorderPoint) {
        alertsList.push({
          id: `reorder-${product.productId}`,
          type: 'warning',
          severity: 'high',
          title: 'Below Reorder Point',
          description: `${product.productName} has reached reorder point`,
          product,
          actionRequired: 'Place purchase order',
          timeframe: '3-5 days',
          estimatedImpact: 'Risk of stockout without action',
          icon: <AlertTriangle className="h-5 w-5 text-orange-600" />
        });
      }
      
      // Significantly overstocked alerts
      else if (stockEfficiency > 2.0) {
        alertsList.push({
          id: `overstock-${product.productId}`,
          type: 'warning',
          severity: 'medium',
          title: 'Excessive Overstock',
          description: `${product.productName} is significantly overstocked`,
          product,
          actionRequired: 'Consider promotional strategies',
          timeframe: '2-4 weeks',
          estimatedImpact: 'Tied up capital and carrying costs',
          icon: <Package className="h-5 w-5 text-orange-600" />
        });
      }
      
      // No sales alerts
      if (product.totalSales === 0) {
        alertsList.push({
          id: `no-sales-${product.productId}`,
          type: 'info',
          severity: 'medium',
          title: 'No Sales Activity',
          description: `${product.productName} has no sales in 6 months`,
          product,
          actionRequired: 'Review product viability',
          timeframe: '4-6 weeks',
          estimatedImpact: 'Dead stock and inventory waste',
          icon: <TrendingDown className="h-5 w-5 text-gray-600" />
        });
      }
      
      // High demand variability alerts
      if (product.demandVariability > 1.0) {
        alertsList.push({
          id: `variability-${product.productId}`,
          type: 'info',
          severity: 'low',
          title: 'High Demand Variability',
          description: `${product.productName} shows unpredictable demand patterns`,
          product,
          actionRequired: 'Improve forecasting methods',
          timeframe: '6-8 weeks',
          estimatedImpact: 'Increased safety stock requirements',
          icon: <Bell className="h-5 w-5 text-blue-600" />
        });
      }
      
      // Declining sales trend alerts
      if (product.salesTrend === 'decreasing' && product.totalSales > 0) {
        alertsList.push({
          id: `declining-${product.productId}`,
          type: 'warning',
          severity: 'medium',
          title: 'Declining Sales Trend',
          description: `${product.productName} shows declining sales pattern`,
          product,
          actionRequired: 'Investigate and take corrective action',
          timeframe: '3-4 weeks',
          estimatedImpact: 'Reduced revenue and excess inventory',
          icon: <TrendingDown className="h-5 w-5 text-red-600" />
        });
      }
    });
    
    // Sort by severity and type
    return alertsList.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      const typeOrder = { critical: 3, warning: 2, info: 1 };
      
      if (a.severity !== b.severity) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      
      return typeOrder[b.type] - typeOrder[a.type];
    });
  }, [products]);
  
  const criticalAlerts = alerts.filter(alert => alert.type === 'critical');
  const warningAlerts = alerts.filter(alert => alert.type === 'warning');
  const infoAlerts = alerts.filter(alert => alert.type === 'info');
  
  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-orange-50 border-orange-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };
  
  const getAlertBadgeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-orange-100 text-orange-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const AlertCard = ({ alert }: { alert: StockAlert }) => (
    <Card className={`${getAlertColor(alert.type)} border-l-4`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {alert.icon}
            <div>
              <CardTitle className="text-lg">{alert.title}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={getAlertBadgeColor(alert.type)}>
              {alert.type.toUpperCase()}
            </Badge>
            <Badge variant="outline" className={getSeverityBadgeColor(alert.severity)}>
              {alert.severity.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Product Details</p>
              <div className="mt-1 text-sm text-gray-600">
                <p><strong>Code:</strong> {alert.product.productCode}</p>
                <p><strong>Current Stock:</strong> {alert.product.currentStock}</p>
                <p><strong>Optimal Stock:</strong> {alert.product.optimalStock}</p>
                <p><strong>Alert Quantity:</strong> {alert.product.alertQty}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700">Sales Performance</p>
              <div className="mt-1 text-sm text-gray-600">
                <p><strong>6M Sales:</strong> {alert.product.totalSales} units</p>
                <p><strong>Monthly Avg:</strong> {alert.product.averageMonthlySales.toFixed(1)} units</p>
                <p><strong>Trend:</strong> {alert.product.salesTrend}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Action Required</p>
              <div className="mt-1 text-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <ArrowRight className="h-3 w-3 text-blue-600" />
                  <span>{alert.actionRequired}</span>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-3 w-3 text-gray-600" />
                  <span><strong>Timeframe:</strong> {alert.timeframe}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-3 w-3 text-orange-600" />
                  <span><strong>Impact:</strong> {alert.estimatedImpact}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                <ShoppingCart className="h-3 w-3 mr-1" />
                Reorder
              </Button>
              <Button size="sm" variant="outline">
                <Mail className="h-3 w-3 mr-1" />
                Notify
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Critical Alerts</h3>
          <p className="text-gray-600">
            All products are within acceptable stock levels. Great job managing your inventory!
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      
      {/* Summary Alert */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>
              <strong>{alerts.length}</strong> stock alerts detected: {' '}
              <span className="text-red-600">{criticalAlerts.length} critical</span>, {' '}
              <span className="text-orange-600">{warningAlerts.length} warning</span>, {' '}
              <span className="text-blue-600">{infoAlerts.length} info</span>
            </span>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                <Mail className="h-3 w-3 mr-1" />
                Email Report
              </Button>
              <Button size="sm" variant="outline">
                <Phone className="h-3 w-3 mr-1" />
                Call Suppliers
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {criticalAlerts.length}
                </div>
                <div className="text-sm text-gray-600">Critical Alerts</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {warningAlerts.length}
                </div>
                <div className="text-sm text-gray-600">Warning Alerts</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {infoAlerts.length}
                </div>
                <div className="text-sm text-gray-600">Info Alerts</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {products.length - alerts.length}
                </div>
                <div className="text-sm text-gray-600">Products OK</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Alert Tabs */}
      <Tabs defaultValue="critical" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="critical" className="flex items-center space-x-2">
            <XCircle className="h-4 w-4" />
            <span>Critical ({criticalAlerts.length})</span>
          </TabsTrigger>
          <TabsTrigger value="warning" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Warning ({warningAlerts.length})</span>
          </TabsTrigger>
          <TabsTrigger value="info" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Info ({infoAlerts.length})</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>All ({alerts.length})</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="critical" className="space-y-4">
          {criticalAlerts.length > 0 ? (
            <div className="space-y-4">
              {criticalAlerts.map(alert => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-gray-600">No critical alerts at this time.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="warning" className="space-y-4">
          {warningAlerts.length > 0 ? (
            <div className="space-y-4">
              {warningAlerts.map(alert => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-gray-600">No warning alerts at this time.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="info" className="space-y-4">
          {infoAlerts.length > 0 ? (
            <div className="space-y-4">
              {infoAlerts.map(alert => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-gray-600">No informational alerts at this time.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          <div className="space-y-4">
            {alerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 