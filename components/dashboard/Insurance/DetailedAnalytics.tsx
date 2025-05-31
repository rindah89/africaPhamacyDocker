"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  FileText, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Users, 
  Clock, 
  BarChart3,
  PieChart,
  Target,
  AlertTriangle
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

interface DetailedAnalyticsProps {
  providers: any[];
  claims: any[];
  reports: any[];
  analytics: {
    claims: {
      total: number;
      pending: number;
      submitted: number;
      paid: number;
      totalAmount: number;
      insuranceAmount: number;
    };
    reports: {
      total: number;
      paid: number;
      paymentRate: number;
    };
  } | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function DetailedAnalytics({ providers, claims, reports, analytics }: DetailedAnalyticsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-CM', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  // Calculate provider statistics
  const providerStats = providers.map(provider => ({
    name: provider.name,
    code: provider.code,
    totalClaims: provider._count?.claims || 0,
    totalReports: provider._count?.reports || 0,
    status: provider.status ? 'Active' : 'Inactive'
  }));

  // Calculate monthly trends
  const monthlyTrends = reports.reduce((acc: any[], report) => {
    const monthKey = `${report.year}-${String(report.month).padStart(2, '0')}`;
    const existing = acc.find(item => item.month === monthKey);
    
    if (existing) {
      existing.totalAmount += report.totalAmount;
      existing.insuranceAmount += report.insuranceAmount;
      existing.reports += 1;
    } else {
      acc.push({
        month: monthKey,
        totalAmount: report.totalAmount,
        insuranceAmount: report.insuranceAmount,
        customerAmount: report.totalAmount - report.insuranceAmount,
        reports: 1
      });
    }
    
    return acc;
  }, []).sort((a, b) => a.month.localeCompare(b.month));

  // Calculate claim status distribution
  const claimStatusData = analytics ? [
    { name: 'Pending', value: analytics.claims.pending, color: '#FFBB28' },
    { name: 'Submitted', value: analytics.claims.submitted, color: '#0088FE' },
    { name: 'Paid', value: analytics.claims.paid, color: '#00C49F' }
  ] : [];

  // Calculate average processing time
  const processedClaims = claims.filter(claim => claim.processedDate);
  const avgProcessingTime = processedClaims.length > 0 
    ? processedClaims.reduce((sum, claim) => {
        const days = Math.ceil((new Date(claim.processedDate).getTime() - new Date(claim.claimDate).getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0) / processedClaims.length
    : 0;

  // Calculate top providers by volume
  const topProviders = providers
    .filter(p => p._count?.claims > 0)
    .sort((a, b) => (b._count?.claims || 0) - (a._count?.claims || 0))
    .slice(0, 5)
    .map(provider => ({
      name: provider.name,
      claims: provider._count?.claims || 0,
      reports: provider._count?.reports || 0
    }));

  // Calculate recent activity
  const recentClaims = claims
    .sort((a, b) => new Date(b.claimDate).getTime() - new Date(a.claimDate).getTime())
    .slice(0, 10);

  if (!analytics) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-muted-foreground">
            Unable to load analytics data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.claims.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Insurance: {formatCurrency(analytics.claims.insuranceAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgProcessingTime)} days</div>
            <p className="text-xs text-muted-foreground">
              From claim to report
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Providers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {providers.filter(p => p.status).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of {providers.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.reports.paymentRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Reports paid on time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Insurance Trends
            </CardTitle>
            <CardDescription>
              Insurance coverage and customer payments over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), '']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="insuranceAmount" 
                  stackId="1"
                  stroke="#0088FE" 
                  fill="#0088FE" 
                  name="Insurance Coverage"
                />
                <Area 
                  type="monotone" 
                  dataKey="customerAmount" 
                  stackId="1"
                  stroke="#FF8042" 
                  fill="#FF8042"
                  name="Customer Payment"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Claim Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Claim Status Distribution
            </CardTitle>
            <CardDescription>
              Current status of all insurance claims
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={claimStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {claimStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value, 'Claims']} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Providers and Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Providers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Providers by Volume
            </CardTitle>
            <CardDescription>
              Insurance providers with most claims processed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProviders.length > 0 ? (
                topProviders.map((provider, index) => (
                  <div key={provider.name} className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{provider.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {provider.claims} claims, {provider.reports} reports
                      </div>
                    </div>
                    <Badge variant="secondary">{provider.claims}</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No providers with claims yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Claims Activity
            </CardTitle>
            <CardDescription>
              Latest insurance claims submitted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentClaims.length > 0 ? (
                recentClaims.slice(0, 8).map((claim) => (
                  <div key={claim.id} className="flex items-center space-x-4">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{claim.claimNumber}</div>
                      <div className="text-xs text-muted-foreground">
                        {claim.customerName} • {formatCurrency(claim.totalAmount)}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(claim.claimDate)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent claims
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provider Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Provider Performance Summary
          </CardTitle>
          <CardDescription>
            Overview of all insurance providers and their activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {providerStats.map((provider) => (
              <Card key={provider.code} className="border-l-4 border-l-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{provider.name}</div>
                    <Badge 
                      variant={provider.status === 'Active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {provider.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Code: {provider.code}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Claims: <strong>{provider.totalClaims}</strong></span>
                    <span>Reports: <strong>{provider.totalReports}</strong></span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {providerStats.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Insurance Providers</h3>
              <p>Add insurance providers to start tracking claims and generating reports</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 