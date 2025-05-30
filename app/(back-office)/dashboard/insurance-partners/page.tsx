import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getInsuranceProviders, getInsuranceClaims, getMonthlyReports, getInsuranceAnalytics } from "@/actions/insurance";
import ProvidersTab from "@/components/dashboard/Insurance/ProvidersTab";
import ClaimsTab from "@/components/dashboard/Insurance/ClaimsTab";
import ReportsTab from "@/components/dashboard/Insurance/ReportsTab";
import AnalyticsCards from "@/components/dashboard/Insurance/AnalyticsCards";

export default async function InsurancePartnersPage() {
  // Fetch all data in parallel
  const [providersResult, claimsResult, reportsResult, analyticsResult] = await Promise.all([
    getInsuranceProviders(),
    getInsuranceClaims(),
    getMonthlyReports(),
    getInsuranceAnalytics()
  ]);

  const providers = providersResult.success ? providersResult.data : [];
  const claims = claimsResult.success ? claimsResult.data : [];
  const reports = reportsResult.success ? reportsResult.data : [];
  const analytics = analyticsResult.success ? analyticsResult.data : null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Insurance Partners</h1>
        <p className="text-muted-foreground">
          Manage insurance providers, claims, and monthly reports for the Cameroonian market
        </p>
      </div>

      {/* Analytics Cards */}
      {analytics && <AnalyticsCards analytics={analytics} />}

      {/* Main Content Tabs */}
      <Tabs defaultValue="providers" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="providers">Providers ({providers.length})</TabsTrigger>
          <TabsTrigger value="claims">Claims ({claims.length})</TabsTrigger>
          <TabsTrigger value="reports">Monthly Reports ({reports.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          <ProvidersTab providers={providers} />
        </TabsContent>

        <TabsContent value="claims" className="space-y-4">
          <ClaimsTab claims={claims} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ReportsTab reports={reports} providers={providers} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Insurance Analytics</CardTitle>
              <CardDescription>
                Detailed analytics and insights for insurance operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Detailed analytics coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 