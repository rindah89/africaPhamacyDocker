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
  data,
  onFilter,
  setIsSearch,
  className,
}: {
  data: any[];
  onFilter: any;
  setIsSearch: any;
  className?: string;
}) {
  const [date, setDate] = useState<DateRange | undefined>(() => {
    const now = new Date();
    return {
      from: startOfYear(now),
      to: now,
    };
  });

  useEffect(() => {
    // Apply initial filter when component mounts
    if (date?.from && date?.to) {
      const startDate = format(date.from, 'yyyy-MM-dd');
      const endDate = format(date.to, 'yyyy-MM-dd');
      const filteredData = filterByDateRange(data, startDate, endDate);
      onFilter(filteredData);
    }
  }, [data, date?.from, date?.to, onFilter]);

  const handleChange = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate);
    setIsSearch(false);
    if (selectedDate?.from && selectedDate?.to) {
      const startDate = format(selectedDate.from, 'yyyy-MM-dd');
      const endDate = format(selectedDate.to, 'yyyy-MM-dd');
      const filteredData = filterByDateRange(data, startDate, endDate);
      onFilter(filteredData);
    }
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
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
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
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}