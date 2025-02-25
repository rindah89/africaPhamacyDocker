"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Clock, Calendar as CalendarIcon, Printer } from "lucide-react";
import { exportToPDF } from "@/app/(back-office)/dashboard/sales/columns";
import { getAllSales } from "@/actions/sales";
import { toast } from "sonner";

interface PrintSalesModalProps {
  trigger?: React.ReactNode;
}

export default function PrintSalesModal({ trigger }: PrintSalesModalProps) {
  // Set default date to today
  const today = new Date();
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);

  // State for date and time
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfToday,
    to: today
  });
  const [time, setTime] = useState({
    from: { hours: "00", minutes: "00" },
    to: { hours: "23", minutes: "59" },
  });
  
  // UI state
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle time input changes
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

    setTime(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: numValue.toString().padStart(2, '0')
      }
    }));
  };

  // Handle print action
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
      
      startDate.setHours(parseInt(time.from.hours), parseInt(time.from.minutes), 0);
      endDate.setHours(parseInt(time.to.hours), parseInt(time.to.minutes), 59);

      // Get filtered sales data
      const sales = await getAllSales(startDate, endDate);
      
      if (!sales || sales.length === 0) {
        toast.error("No sales data found for the selected period");
        return;
      }

      // Export to PDF
      exportToPDF(sales, { from: startDate, to: endDate });
      setIsOpen(false);
      toast.success("Sales report generated successfully");
    } catch (error) {
      console.error("Error generating sales report:", error);
      toast.error("Failed to generate sales report");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Button to open modal */}
      <Button 
        variant="default" 
        className="flex items-center gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Printer className="h-4 w-4" />
        Print Sales
      </Button>

      {/* Modal dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Print Sales Report</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {/* Date selection */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="border rounded-md p-4">
                <Calendar
                  mode="range"
                  selected={date}
                  onSelect={setDate}
                  className="mx-auto"
                  initialFocus
                />
              </div>
              <div className="text-sm text-center mt-2">
                {date?.from && date?.to ? (
                  <span>
                    {format(date.from, "MMM dd, yyyy")} - {format(date.to, "MMM dd, yyyy")}
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
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePrint} disabled={isLoading}>
              {isLoading ? "Generating..." : "Generate PDF"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 