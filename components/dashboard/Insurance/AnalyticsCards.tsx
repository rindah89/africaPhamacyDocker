import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, FileText, DollarSign, Calendar, CheckCircle } from "lucide-react";

interface AnalyticsCardsProps {
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
  };
}

export default function AnalyticsCards({ analytics }: AnalyticsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const claimProcessingRate = analytics.claims.total > 0 
    ? ((analytics.claims.submitted + analytics.claims.paid) / analytics.claims.total * 100).toFixed(1)
    : '0';

  const customerPaymentAmount = analytics.claims.totalAmount - analytics.claims.insuranceAmount;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Claims */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.claims.total}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-yellow-600">
              {analytics.claims.pending} Pending
            </Badge>
            <Badge variant="outline" className="text-blue-600">
              {analytics.claims.submitted} Submitted
            </Badge>
            <Badge variant="outline" className="text-green-600">
              {analytics.claims.paid} Paid
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Insurance Coverage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Insurance Coverage</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(analytics.claims.insuranceAmount)}</div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <span>Customer paid: {formatCurrency(customerPaymentAmount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Reports */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Reports</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.reports.total}</div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>{analytics.reports.paid} paid reports</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Collection Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.reports.paymentRate.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground">
            Insurance payment collection rate
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 