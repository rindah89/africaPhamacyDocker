"use client";

import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import React, { useState, useMemo } from "react";
import { columns, exportToPDF } from "./columns";
import { getAllSales } from "@/actions/sales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/formatMoney";
import { Button } from "@/components/ui/button";
import { FileDown, Calendar, RefreshCw, Printer, Clock, Settings2 } from "lucide-react";
import { Table } from "@tanstack/react-table";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [tempPrintDate, setTempPrintDate] = useState<DateRange | undefined>({
    from: startOfToday,
    to: today
  });
  const [printTime, setPrintTime] = useState({
    from: { hours: "00", minutes: "00" },
    to: { hours: "23", minutes: "59" },
  });
  const [isPrinting, setIsPrinting] = useState(false);
  const [activeTab, setActiveTab] = useState("custom");
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Default shift configurations
  const [shiftConfig, setShiftConfig] = useState({
    morning: {
      from: { hours: "06", minutes: "00" },
      to: { hours: "14", minutes: "00" },
    },
    afternoon: {
      from: { hours: "14", minutes: "00" },
      to: { hours: "22", minutes: "00" },
    },
    night: {
      from: { hours: "22", minutes: "00" },
      to: { hours: "06", minutes: "00" },
    }
  });

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
  
  // Handle shift config changes
  const handleShiftConfigChange = (
    shift: 'morning' | 'afternoon' | 'night',
    type: 'from' | 'to',
    field: 'hours' | 'minutes',
    value: string
  ) => {
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

    setShiftConfig(prev => ({
      ...prev,
      [shift]: {
        ...prev[shift],
        [type]: {
          ...prev[shift][type],
          [field]: numValue.toString().padStart(2, '0')
        }
      }
    }));
  };
  
  // Apply shift time to print time
  const applyShift = (shift: 'morning' | 'afternoon' | 'night') => {
    setPrintTime(shiftConfig[shift]);
    setActiveTab('custom');
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
      
      // Determine which time range to use based on active tab
      let timeToUse = printTime;
      if (activeTab !== "custom") {
        timeToUse = shiftConfig[activeTab as 'morning' | 'afternoon' | 'night'];
      }
      
      startDate.setHours(parseInt(timeToUse.from.hours), parseInt(timeToUse.from.minutes), 0);
      endDate.setHours(parseInt(timeToUse.to.hours), parseInt(timeToUse.to.minutes), 59);

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

  // Apply date selection
  const applyDateSelection = () => {
    if (tempPrintDate) {
      setPrintDate(tempPrintDate);
      setShowCalendar(false);
    }
  };

  // Cancel date selection
  const cancelDateSelection = () => {
    setTempPrintDate(printDate);
    setShowCalendar(false);
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
            <Button 
              variant="default" 
              className="flex items-center gap-2"
              onClick={() => setPrintModalOpen(true)}
            >
              <Printer className="h-4 w-4" />
              Print Sales
            </Button>
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Print Sales Report</DialogTitle>
            <DialogDescription>
              Select date and time range to filter sales data for printing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {/* Date selection */}
            <div className="mb-6">
              <Label className="mb-2 block">Date Range</Label>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                onClick={() => setShowCalendar(true)}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {printDate?.from && printDate?.to ? (
                  <span>
                    {format(printDate.from, "MMM dd, yyyy")} - {format(printDate.to, "MMM dd, yyyy")}
                  </span>
                ) : (
                  <span>Select a date range</span>
                )}
              </Button>
              
              {showCalendar && (
                <div className="mt-2 border rounded-md p-4">
                  <CalendarComponent
                    mode="range"
                    selected={tempPrintDate}
                    onSelect={setTempPrintDate}
                    className="mx-auto"
                    initialFocus
                    numberOfMonths={2}
                  />
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={cancelDateSelection}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={applyDateSelection}>
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Time selection with tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="custom">Custom</TabsTrigger>
                <TabsTrigger value="morning">Morning</TabsTrigger>
                <TabsTrigger value="afternoon">Afternoon</TabsTrigger>
                <TabsTrigger value="night">Night</TabsTrigger>
              </TabsList>
              
              <TabsContent value="custom" className="space-y-4">
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
              </TabsContent>
              
              <TabsContent value="morning" className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Morning Shift</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => applyShift('morning')}
                    className="text-xs"
                  >
                    Apply to Custom
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <Input
                        className="w-[5rem]"
                        value={shiftConfig.morning.from.hours}
                        onChange={(e) => handleShiftConfigChange("morning", "from", "hours", e.target.value)}
                        placeholder="HH"
                        maxLength={2}
                      />
                      :
                      <Input
                        className="w-[5rem]"
                        value={shiftConfig.morning.from.minutes}
                        onChange={(e) => handleShiftConfigChange("morning", "from", "minutes", e.target.value)}
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
                        value={shiftConfig.morning.to.hours}
                        onChange={(e) => handleShiftConfigChange("morning", "to", "hours", e.target.value)}
                        placeholder="HH"
                        maxLength={2}
                      />
                      :
                      <Input
                        className="w-[5rem]"
                        value={shiftConfig.morning.to.minutes}
                        onChange={(e) => handleShiftConfigChange("morning", "to", "minutes", e.target.value)}
                        placeholder="MM"
                        maxLength={2}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="afternoon" className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Afternoon Shift</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => applyShift('afternoon')}
                    className="text-xs"
                  >
                    Apply to Custom
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <Input
                        className="w-[5rem]"
                        value={shiftConfig.afternoon.from.hours}
                        onChange={(e) => handleShiftConfigChange("afternoon", "from", "hours", e.target.value)}
                        placeholder="HH"
                        maxLength={2}
                      />
                      :
                      <Input
                        className="w-[5rem]"
                        value={shiftConfig.afternoon.from.minutes}
                        onChange={(e) => handleShiftConfigChange("afternoon", "from", "minutes", e.target.value)}
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
                        value={shiftConfig.afternoon.to.hours}
                        onChange={(e) => handleShiftConfigChange("afternoon", "to", "hours", e.target.value)}
                        placeholder="HH"
                        maxLength={2}
                      />
                      :
                      <Input
                        className="w-[5rem]"
                        value={shiftConfig.afternoon.to.minutes}
                        onChange={(e) => handleShiftConfigChange("afternoon", "to", "minutes", e.target.value)}
                        placeholder="MM"
                        maxLength={2}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="night" className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Night Shift</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => applyShift('night')}
                    className="text-xs"
                  >
                    Apply to Custom
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <Input
                        className="w-[5rem]"
                        value={shiftConfig.night.from.hours}
                        onChange={(e) => handleShiftConfigChange("night", "from", "hours", e.target.value)}
                        placeholder="HH"
                        maxLength={2}
                      />
                      :
                      <Input
                        className="w-[5rem]"
                        value={shiftConfig.night.from.minutes}
                        onChange={(e) => handleShiftConfigChange("night", "from", "minutes", e.target.value)}
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
                        value={shiftConfig.night.to.hours}
                        onChange={(e) => handleShiftConfigChange("night", "to", "hours", e.target.value)}
                        placeholder="HH"
                        maxLength={2}
                      />
                      :
                      <Input
                        className="w-[5rem]"
                        value={shiftConfig.night.to.minutes}
                        onChange={(e) => handleShiftConfigChange("night", "to", "minutes", e.target.value)}
                        placeholder="MM"
                        maxLength={2}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
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
