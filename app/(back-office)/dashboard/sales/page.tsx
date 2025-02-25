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
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";

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
  
  // Print Sales Modal state
  const today = new Date();
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);
  
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printDate, setPrintDate] = useState<DateRange | undefined>({
    from: startOfToday,
    to: today
  });
  const [printTime, setPrintTime] = useState({
    from: { hours: "00", minutes: "00" },
    to: { hours: "23", minutes: "59" },
  });
  const [isPrinting, setIsPrinting] = useState(false);

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
  
  // Handle time input changes for print modal
  const handlePrintTimeChange = (type: 'from' | 'to', field: 'hours' | 'minutes', value: string) => {
    let numValue = parseInt(value);
    
    // Validate hours (0-23)
    if (field === 'hours') {
      if (isNaN(numValue) || numValue < 0) numValue = 0;
      if (numValue > 23) numValue = 23;
    }
    // Validate minutes (0-59)
    if (field === 'minutes') {
      if (isNaN(numValue) || numValue < 0) numValue = 0;
      if (numValue > 59) numValue = 59;
    }

    setPrintTime(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: numValue.toString().padStart(2, '0')
      }
    }));
  };

  // Handle print action
  const handlePrint = async () => {
    if (!printDate?.from || !printDate?.to) {
      toast.error("Please select a date range");
      return;
    }

    try {
      setIsPrinting(true);

      // Create Date objects with the selected times
      const startDate = new Date(printDate.from);
      const endDate = new Date(printDate.to);
      
      startDate.setHours(parseInt(printTime.from.hours), parseInt(printTime.from.minutes), 0);
      endDate.setHours(parseInt(printTime.to.hours), parseInt(printTime.to.minutes), 59);

      // Get filtered sales data
      const salesData = await getAllSales(startDate, endDate);
      
      if (!salesData || salesData.length === 0) {
        toast.error("No sales data found for the selected period");
        return;
      }

      // Export to PDF
      exportToPDF(salesData, { from: startDate, to: endDate });
      setPrintModalOpen(false);
      toast.success("Sales report generated successfully");
    } catch (error) {
      console.error("Error generating sales report:", error);
      toast.error("Failed to generate sales report");
    } finally {
      setIsPrinting(false);
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

      {/* Direct Print Button */}
      

      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div></div> {/* Empty div for flex spacing */}
          <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="lg"
          className="flex items-center gap-2"
          onClick={handleExportPDF}
        >
          <Printer className="h-5 w-5" />
          PRINT SALES
        </Button>
      </div>
          <div className="flex items-center gap-2">
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
      
      {/* Print Sales Modal */}
      <Dialog open={printModalOpen} onOpenChange={setPrintModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Print Sales Report</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {/* Date selection */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="border rounded-md p-4">
                <CalendarComponent
                  mode="range"
                  selected={printDate}
                  onSelect={setPrintDate}
                  className="mx-auto"
                  initialFocus
                />
              </div>
              <div className="text-sm text-center mt-2">
                {printDate?.from && printDate?.to ? (
                  <span>
                    {format(printDate.from, "MMM dd, yyyy")} - {format(printDate.to, "MMM dd, yyyy")}
                  </span>
                ) : (
                  <span>Select a date range</span>
                )}
              </div>
            </div>
            
            {/* Time selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <Input
                    className="w-[5rem]"
                    value={printTime.from.hours}
                    onChange={(e) => handlePrintTimeChange("from", "hours", e.target.value)}
                    placeholder="HH"
                    maxLength={2}
                  />
                  :
                  <Input
                    className="w-[5rem]"
                    value={printTime.from.minutes}
                    onChange={(e) => handlePrintTimeChange("from", "minutes", e.target.value)}
                    placeholder="MM"
                    maxLength={2}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <Input
                    className="w-[5rem]"
                    value={printTime.to.hours}
                    onChange={(e) => handlePrintTimeChange("to", "hours", e.target.value)}
                    placeholder="HH"
                    maxLength={2}
                  />
                  :
                  <Input
                    className="w-[5rem]"
                    value={printTime.to.minutes}
                    onChange={(e) => handlePrintTimeChange("to", "minutes", e.target.value)}
                    placeholder="MM"
                    maxLength={2}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrintModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePrint} disabled={isPrinting}>
              {isPrinting ? "Generating..." : "Generate PDF"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
