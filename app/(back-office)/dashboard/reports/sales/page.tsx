"use client";

import React, { useState, useEffect } from "react";
import { getSalesReport } from "@/actions/reports";
import SalesReport from "@/components/dashboard/Reports/SalesReport";
import SalesDateFilter from "@/components/dashboard/Reports/SalesDateFilter";
import { DateRange } from "react-day-picker";
import { startOfMonth, endOfDay } from "date-fns";
import { exportToPDF } from "./columns";
import exportSalesDataToExcel from "@/lib/exportSalesDataToExcel";
import toast from "react-hot-toast";

export default function SalesReportPage() {
  const [salesData, setSalesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const now = new Date();
    return {
      from: startOfMonth(now),
      to: endOfDay(now)
    };
  });

  const fetchSalesData = async (startDate?: Date, endDate?: Date) => {
    try {
      setLoading(true);
      console.log('Fetching sales data for range:', { startDate, endDate });
      
      const data = await getSalesReport(startDate, endDate);
      console.log('Sales report data received:', {
        hasData: !!data,
        salesCount: data?.sales?.length,
        hasTotals: !!data?.totals,
        dailySalesCount: data?.dailySales?.length
      });
      
      setSalesData(data);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      toast.error('Failed to load sales data');
      setSalesData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      fetchSalesData(dateRange.from, dateRange.to);
    }
  }, [dateRange]);

  const handleExportPDF = () => {
    if (salesData?.sales && salesData.sales.length > 0) {
      exportToPDF(salesData.sales);
      toast.success('PDF exported successfully!');
    } else {
      toast.error('No data to export');
    }
  };

  const handleExportExcel = async () => {
    if (salesData?.sales && salesData.sales.length > 0) {
      try {
        const fromDate = dateRange?.from?.toLocaleDateString() || 'Unknown';
        const toDate = dateRange?.to?.toLocaleDateString() || 'Unknown';
        const filename = `Sales Report ${fromDate} to ${toDate}`;
        await exportSalesDataToExcel(salesData.sales, filename);
        toast.success('Excel file exported successfully!');
      } catch (error) {
        console.error('Export error:', error);
        toast.error('Failed to export Excel file');
      }
    } else {
      toast.error('No data to export');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SalesDateFilter
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          isLoading={true}
        />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!salesData) {
    return (
      <div className="space-y-6">
        <SalesDateFilter
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
        <div className="text-center text-red-600">
          Error loading sales report. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SalesDateFilter
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
        isLoading={loading}
      />
      <SalesReport 
        sales={salesData.sales} 
        totals={salesData.totals} 
        dailySales={salesData.dailySales} 
      />
    </div>
  );
} 