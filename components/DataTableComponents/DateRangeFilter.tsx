"use client";
import {
  filterByDateRange,
  filterByLast7Days,
  filterByThisMonth,
  filterByThisYear,
  filterByToday,
  filterByYesterday,
} from "@/lib/dateFilters";
import React, { useState, useEffect } from "react";
import Select from "react-tailwindcss-select";
import { SelectValue } from "react-tailwindcss-select/dist/components/type";
import { addDays, format, startOfYear } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function DateRangeFilter({
  // data, // data prop is not strictly needed for date picking, parent handles filtering
  // onFilter, // onFilter is not needed as parent handles data fetching based on dateRangeChange
  // setIsSearch, // setIsSearch is not directly relevant to date range selection anymore
  className,
  dateRange,
  onDateRangeChange,
}: {
  // data: any[];
  // onFilter: any;
  // setIsSearch: any;
  className?: string;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}) {
  console.log('DateRangeFilter analitycs: Received onDateRangeChange prop:', typeof onDateRangeChange, onDateRangeChange);
  const handleChange = (selectedDate: DateRange | undefined) => {
    onDateRangeChange(selectedDate); // Only call the callback to notify the parent
    // setIsSearch(false); // Parent will manage search state if needed upon data reload
    // Client-side filtering based on dates is removed as parent now refetches from server
    // if (selectedDate?.from && selectedDate?.to) {
    //   const startDate = format(selectedDate.from, 'yyyy-MM-dd');
    //   const endDate = format(selectedDate.to, 'yyyy-MM-dd');
    //   const filteredData = filterByDateRange(data, startDate, endDate);
    //   onFilter(filteredData);
    // }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}