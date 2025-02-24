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
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { exportToPDF } from "@/app/(back-office)/dashboard/sales/columns";
import { getAllSales } from "@/actions/sales";
import { toast } from "sonner";

interface PrintSalesModalProps {
  trigger?: React.ReactNode;
}

interface TimeRange {
  from: { hours: string; minutes: string };
  to: { hours: string; minutes: string };
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

  const [isLoading, setIsLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const handlePrint = async () => {
    if (!date?.from || !date?.to) {
      toast.error("Please select a date range");
      return;
    }

    try {
      setIsLoading(true);

      // Create Date objects with the selected times
      const startDate = new Date(date.from);
      startDate.setHours(parseInt(time.from.hours), parseInt(time.from.minutes), 0);

      const endDate = new Date(date.to);
      endDate.setHours(parseInt(time.to.hours), parseInt(time.to.minutes), 59);

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

    setTime(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: numValue.toString().padStart(2, '0')
      }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Print Sales</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Print Sales Report</DialogTitle>
          <DialogDescription>
            Select date and time range to filter sales data for printing.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Date and Time Range</Label>
            <DatePickerWithRange 
              date={date} 
              time={time}
              onDateChange={setDate}
              onTimeChange={setTime}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handlePrint} disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 