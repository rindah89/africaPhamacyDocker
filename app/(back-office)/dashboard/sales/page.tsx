'use client';
export const dynamic = 'force-dynamic';
import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import React, { Suspense, useState, useEffect, useCallback } from "react";
import { columns, exportToPDF } from "./columns";
import { getAllSalesPaginated, getAllSalesSimple } from "@/actions/sales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/formatMoney";
import Loading from "./loading";
import Link from "next/link";
import ExportButton from "@/components/dashboard/Sales/ExportButton";
import { Sale } from "@prisma/client";
import { DateRange } from "react-day-picker";
import { startOfYear } from "date-fns";

// Load More Sales Button Component
function LoadMoreButton({ totalCount, currentCount, isLoading }: { totalCount: number; currentCount: number; isLoading: boolean }) {
  const hasMore = currentCount < totalCount;
  
  if (!hasMore || isLoading) return null;

  return (
    <div className="flex justify-center mt-6">
      <Link
        href="/dashboard/sales?limit=100"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Load More Sales ({totalCount - currentCount} remaining)
      </Link>
    </div>
  );
}

function SalesContent({ searchParams }: { searchParams?: { limit?: string } }) {
  const [initialSalesData, setInitialSalesData] = useState<Sale[]>([]);
  const [processedSalesData, setProcessedSalesData] = useState<Sale[]>([]);
  const [totalSalesCount, setTotalSalesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const now = new Date();
    console.log("SalesContent: Initializing dateRange state.");
    return {
      from: startOfYear(now),
      to: now,
    };
  });

  const requestedLimit = searchParams?.limit ? parseInt(searchParams.limit) : 50;
  const [currentLimit, setCurrentLimit] = useState(Math.min(Math.max(requestedLimit, 1), 200));

  const fetchSales = useCallback(async () => {
    setIsLoading(true);
    setIsUsingFallback(false);
    console.log(`FETCHING sales with dateRange: FROM: ${dateRange?.from?.toISOString()} TO: ${dateRange?.to?.toISOString()}, limit: ${currentLimit}`);
    try {
      let result;
      try {
        result = await getAllSalesPaginated(1, currentLimit, dateRange?.from, dateRange?.to);
      } catch (mainError) {
        console.warn("Main sales fetch failed, trying fallback:", mainError);
        result = await getAllSalesSimple(1, currentLimit, dateRange?.from, dateRange?.to);
        setIsUsingFallback(true);
      }
      
      setInitialSalesData(result?.sales || []);
      setTotalSalesCount(result?.totalCount || 0);
      setProcessedSalesData(result?.sales || []);
      console.log(`FETCHED ${result?.sales?.length || 0} sales. Total count from server: ${result?.totalCount || 0} for dates: ${dateRange?.from?.toISOString()} - ${dateRange?.to?.toISOString()}`);

    } catch (error) {
      console.error("Error fetching sales in SalesContent:", error);
      setInitialSalesData([]);
      setTotalSalesCount(0);
      setProcessedSalesData([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentLimit, dateRange]);

  useEffect(() => {
    console.log(`SalesContent: useEffect for fetchSales triggered. Current DateRange for fetch: FROM: ${dateRange?.from?.toISOString()} TO: ${dateRange?.to?.toISOString()}`);
    fetchSales();
  }, [fetchSales]);

  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    console.log("SalesContent: handleDateRangeChange called with newRange:", newRange);
    setDateRange(newRange);
  };

  const totalItems = initialSalesData.reduce((acc, sale) => acc + sale.qty, 0);
  const totalSalesRevenue = initialSalesData.reduce((acc, sale) => acc + (sale.salePrice * sale.qty), 0);

  return (
    <>
      {isUsingFallback && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded text-orange-800">
          <strong>Performance Notice:</strong> Using simplified query due to potential database load.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Items Sold (Selected Range)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '...' : totalItems.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From {isLoading ? '...' : initialSalesData.length} sales records</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue (Selected Range)</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : formatMoney(totalSalesRevenue)}</div>
            <p className="text-xs text-muted-foreground">Current filter total</p>
        </CardContent>
      </Card>
    </div>

    <div className="flex justify-between items-center mb-4">
      <TableHeader
        title="Sales"
        linkTitle="New Sale"
        href="/pos"
        data={initialSalesData}
        model="sale"
      />
      {(processedSalesData.length > 0 || isLoading) && (
        <ExportButton 
          data={isLoading ? [] : processedSalesData} 
          exportFunction={(dataToExport) => exportToPDF(dataToExport, dateRange)}
          buttonText="Export Sales PDF"
        />
      )}
    </div>
      
      {isLoading && !initialSalesData.length ? (
        <Loading />
      ) : (
        <DataTable 
          tableTitle="sales" 
          columns={columns} 
          data={initialSalesData}
          initialSorting={[{ id: "createdAt", desc: true }]}
          onProcessedDataChange={setProcessedSalesData}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
        />
      )}
      
      <LoadMoreButton 
        totalCount={totalSalesCount} 
        currentCount={initialSalesData.length} 
        isLoading={isLoading} 
      />
    </>
  );
}

export default function Page({ searchParams }: { searchParams?: { limit?: string } }) {
  return (
    <div>
      <Suspense fallback={<Loading />}>
        <SalesContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
