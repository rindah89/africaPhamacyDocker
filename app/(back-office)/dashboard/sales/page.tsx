"use client";

import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import React, { useState, useMemo } from "react";
import { columns, exportToPDF } from "./columns";
import { getAllSales } from "@/actions/sales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/formatMoney";
import { Button } from "@/components/ui/button";
import { FileDown, Calendar, RefreshCw, Printer } from "lucide-react";
import { Table } from "@tanstack/react-table";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import PrintSalesModal from "@/components/dashboard/Reports/PrintSalesModal";

export default function SalesPage() {
  const [sales, setSales] = React.useState<any[]>([]);
  const [selectedSales, setSelectedSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [tableRef, setTableRef] = useState<Table<any>>();
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [date, setDate] = React.useState<DateRange | undefined>(undefined);
  const [time, setTime] = React.useState({
    from: { hours: "00", minutes: "00" },
    to: { hours: "23", minutes: "59" },
  });
  const [isBackfilling, setIsBackfilling] = useState(false);

  React.useEffect(() => {
    const loadSales = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let data;
        if (!date?.from || !date?.to) {
          // If no date range is selected, get all sales
          data = await getAllSales();
        } else {
          // Create Date objects with the selected times
          const startDate = new Date(date.from);
          startDate.setHours(parseInt(time.from.hours), parseInt(time.from.minutes), 0);

          const endDate = new Date(date.to);
          endDate.setHours(parseInt(time.to.hours), parseInt(time.to.minutes), 59);

          data = await getAllSales(startDate, endDate);
        }
        
        setSales(data || []);
        setFilteredData(data || []);
      } catch (err) {
        setError("Failed to load sales data. Please try refreshing the page.");
        console.error("Error loading sales:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSales();
  }, [date, time]);

  // Sort sales by date (most recent first)
  const sortedSales = useMemo(() => 
    [...sales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [sales]
  );

  // Calculate totals based on selected sales or filtered data
  const { totalItems, totalSales } = useMemo(() => {
    const salesToCalculate = selectedSales.length > 0 ? selectedSales : filteredData;

    const totalItems = salesToCalculate.reduce((acc, sale) => {
      return acc + sale.qty;
    }, 0);

    const totalSales = salesToCalculate.reduce((acc, sale) => {
      return acc + (sale.salePrice * sale.qty);
    }, 0);

    return {
      totalItems,
      totalSales
    };
  }, [selectedSales, filteredData]);

  // Custom export function that passes selected sales and date range
  const handleExportPDF = useMemo(() => {
    return () => {
      const dataToExport = selectedSales.length > 0 ? selectedSales : filteredData;
      const dateFilter = tableRef?.getState().columnFilters.find(f => f.id === 'createdAt')?.value as { from?: string; to?: string } | undefined;
      
      if (dateFilter?.from && dateFilter?.to) {
        exportToPDF(dataToExport, {
          from: new Date(dateFilter.from),
          to: new Date(dateFilter.to)
        });
      } else {
        exportToPDF(dataToExport);
      }
    };
  }, [selectedSales, filteredData, tableRef]);

  const handleBackfill = async () => {
    try {
      setIsBackfilling(true);
      const response = await fetch('/api/sales/backfill', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to backfill sales');
      }

      const result = await response.json();
      
      // Show success message using Sonner
      toast.success("Backfill Complete", {
        description: `Processed ${result.totalProcessed} orders: ${result.totalSuccess} successful, ${result.totalFailed} failed.`
      });

      // Refresh the sales data
      if (date?.from && date?.to) {
        const startDate = new Date(date.from);
        startDate.setHours(parseInt(time.from.hours), parseInt(time.from.minutes), 0);

        const endDate = new Date(date.to);
        endDate.setHours(parseInt(time.to.hours), parseInt(time.to.minutes), 59);

        const data = await getAllSales(startDate, endDate);
        setSales(data || []);
        setFilteredData(data || []);
      }
    } catch (error) {
      console.error('Backfill error:', error);
      toast.error("Error", {
        description: "Failed to backfill sales records. Please try again."
      });
    } finally {
      setIsBackfilling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p>Loading sales data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-2 text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(totalSales)}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div></div> {/* Empty div for flex spacing */}
          <div className="flex items-center gap-2">
            <PrintSalesModal 
              trigger={
                <Button variant="default" className="flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Print Sales
                </Button>
              } 
            />
            <Button
              onClick={handleBackfill}
              className="flex items-center gap-2"
              variant="outline"
              disabled={isBackfilling}
            >
              <RefreshCw className={`h-4 w-4 ${isBackfilling ? 'animate-spin' : ''}`} />
              {isBackfilling ? 'Backfilling...' : 'Backfill Sales'}
            </Button>
          </div>
        </div>
        <TableHeader
          title="Sales"
          linkTitle="Add Sale"
          href="/pos"
          data={sortedSales}
          model="sale"
          customExportPDF={handleExportPDF}
        />
        <DataTable 
          columns={columns} 
          data={sortedSales}
          initialSorting={[{ id: "createdAt", desc: true }]}
          onSelectionChange={setSelectedSales}
          onTableCreated={setTableRef}
          onDataFiltered={setFilteredData}
        />
      </div>
    </div>
  );
}
