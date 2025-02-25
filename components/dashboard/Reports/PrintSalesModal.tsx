"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { exportToPDF } from "@/app/(back-office)/dashboard/sales/columns";
import { getAllSales } from "@/actions/sales";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Settings2, Calendar, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";

interface PrintSalesModalProps {
  trigger?: React.ReactNode;
}

interface TimeRange {
  from: { hours: string; minutes: string };
  to: { hours: string; minutes: string };
}

interface ShiftConfig {
  morning: TimeRange;
  afternoon: TimeRange;
  night: TimeRange;
}

export default function PrintSalesModal({ trigger }: PrintSalesModalProps) {
  // Set default date to today
  const today = new Date();
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);

  // Initialize with today's date range and current time
  const [date, setDate] = React.useState<DateRange>({
    from: startOfToday,
    to: today
  });

  // Set initial time range from midnight to current time
  const [time, setTime] = React.useState<TimeRange>({
    from: { hours: "00", minutes: "00" },
    to: {
      hours: today.getHours().toString().padStart(2, '0'),
      minutes: today.getMinutes().toString().padStart(2, '0')
    }
  });

  // Default shift configurations
  const [shiftConfig, setShiftConfig] = React.useState<ShiftConfig>({
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

  const [isLoading, setIsLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("custom");
  
  // State for custom date picker display
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<DateRange | undefined>(date);
  const [tempTime, setTempTime] = React.useState<TimeRange>(time);

  // Update temp values when date or time changes
  React.useEffect(() => {
    setTempDate(date);
    setTempTime(time);
  }, [date, time]);

  const handlePrint = async () => {
    if (!date?.from || !date?.to) {
      toast.error("Please select a date range");
      return;
    }

    try {
      setIsLoading(true);

      // Create Date objects with the selected times
      const startDate = new Date(date.from);
      const endDate = new Date(date.to);
      
      // Determine which time range to use based on active tab
      let timeToUse = time;
      if (activeTab !== "custom") {
        timeToUse = shiftConfig[activeTab as keyof ShiftConfig];
      }
      
      startDate.setHours(parseInt(timeToUse.from.hours), parseInt(timeToUse.from.minutes), 0);
      endDate.setHours(parseInt(timeToUse.to.hours), parseInt(timeToUse.to.minutes), 59);

      // Get filtered sales data
      const sales = await getAllSales(startDate, endDate);
      
      if (!sales || sales.length === 0) {
        toast.error("No sales data found for the selected period");
        return;
      }

      // Export to PDF
      exportToPDF(sales, { from: startDate, to: endDate });
      setOpen(false);
      toast.success("Sales report generated successfully");
    } catch (error) {
      console.error("Error generating sales report:", error);
      toast.error("Failed to generate sales report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeChange = (type: 'from' | 'to', field: 'hours' | 'minutes', value: string) => {
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

    setTempTime(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: numValue.toString().padStart(2, '0')
      }
    }));
  };

  const handleShiftConfigChange = (
    shift: keyof ShiftConfig,
    type: "from" | "to",
    field: "hours" | "minutes",
    value: string
  ) => {
    let normalizedValue = value.replace(/\D/g, "");
    if (field === "hours") {
      normalizedValue = Math.min(23, Math.max(0, parseInt(normalizedValue) || 0)).toString().padStart(2, "0");
    } else {
      normalizedValue = Math.min(59, Math.max(0, parseInt(normalizedValue) || 0)).toString().padStart(2, "0");
    }

    setShiftConfig({
      ...shiftConfig,
      [shift]: {
        ...shiftConfig[shift],
        [type]: {
          ...shiftConfig[shift][type],
          [field]: normalizedValue,
        },
      },
    });
  };

  const applyShift = (shift: keyof ShiftConfig) => {
    setTime(shiftConfig[shift]);
    setActiveTab("custom"); // Switch back to custom tab after applying shift
  };
  
  const applyDateTimeSelection = () => {
    if (tempDate) {
      setDate(tempDate);
      setTime(tempTime);
      setShowDatePicker(false);
    }
  };

  // Simplified component to ensure it renders properly
  return (
    <>
      <div onClick={() => setOpen(true)}>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print Sales
          </Button>
        )}
      </div>

      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Print Sales Report</DialogTitle>
              <DialogDescription>
                Select date and time range to filter sales data for printing.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal mb-4"
                onClick={() => setShowDatePicker(true)}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {date?.from && date?.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <Input
                      className="w-[5rem]"
                      value={time.from.hours}
                      onChange={(e) => handleTimeChange("from", "hours", e.target.value)}
                      placeholder="HH"
                      maxLength={2}
                    />
                    :
                    <Input
                      className="w-[5rem]"
                      value={time.from.minutes}
                      onChange={(e) => handleTimeChange("from", "minutes", e.target.value)}
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
                      value={time.to.hours}
                      onChange={(e) => handleTimeChange("to", "hours", e.target.value)}
                      placeholder="HH"
                      maxLength={2}
                    />
                    :
                    <Input
                      className="w-[5rem]"
                      value={time.to.minutes}
                      onChange={(e) => handleTimeChange("to", "minutes", e.target.value)}
                      placeholder="MM"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Custom date picker overlay */}
            {showDatePicker && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <Card className="w-full max-w-[800px] max-h-[90vh] overflow-visible">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Select Date Range</h3>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setShowDatePicker(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-6">
                      <CalendarComponent
                        initialFocus
                        mode="range"
                        defaultMonth={tempDate?.from}
                        selected={tempDate}
                        onSelect={setTempDate}
                        numberOfMonths={2}
                        className="rounded-md border w-full"
                      />
                      
                      <div className="flex justify-end gap-2 mt-6">
                        <Button variant="outline" onClick={() => setShowDatePicker(false)}>
                          Cancel
                        </Button>
                        <Button onClick={applyDateTimeSelection}>
                          Apply
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePrint} disabled={isLoading}>
                {isLoading ? "Generating..." : "Generate PDF"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
} 