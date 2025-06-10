"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Download, FileSpreadsheet } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subWeeks, subMonths } from "date-fns";
import { cn } from "@/lib/utils";

interface SalesDateFilterProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onExportPDF?: () => void;
  onExportExcel?: () => void;
  isLoading?: boolean;
}

type FilterOption = {
  label: string;
  value: string;
  getDateRange: () => DateRange;
  description: string;
};

const getFilterOptions = (): FilterOption[] => {
  const now = new Date();
  
  return [
    {
      label: "Today",
      value: "today",
      description: "Sales from today only",
      getDateRange: () => ({
        from: startOfDay(now),
        to: endOfDay(now)
      })
    },
    {
      label: "Yesterday", 
      value: "yesterday",
      description: "Sales from yesterday",
      getDateRange: () => {
        const yesterday = subDays(now, 1);
        return {
          from: startOfDay(yesterday),
          to: endOfDay(yesterday)
        };
      }
    },
    {
      label: "This Week",
      value: "thisWeek", 
      description: "Sales from Monday to today",
      getDateRange: () => ({
        from: startOfWeek(now, { weekStartsOn: 1 }), // Monday
        to: endOfDay(now)
      })
    },
    {
      label: "Last Week",
      value: "lastWeek",
      description: "Sales from last Monday to Sunday",
      getDateRange: () => {
        const lastWeek = subWeeks(now, 1);
        return {
          from: startOfWeek(lastWeek, { weekStartsOn: 1 }),
          to: endOfWeek(lastWeek, { weekStartsOn: 1 })
        };
      }
    },
    {
      label: "This Month",
      value: "thisMonth",
      description: "Sales from start of month to today", 
      getDateRange: () => ({
        from: startOfMonth(now),
        to: endOfDay(now)
      })
    },
    {
      label: "Last Month",
      value: "lastMonth",
      description: "Sales from last month",
      getDateRange: () => {
        const lastMonth = subMonths(now, 1);
        return {
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth)
        };
      }
    },
    {
      label: "Last 7 Days",
      value: "last7Days",
      description: "Sales from the past 7 days",
      getDateRange: () => ({
        from: startOfDay(subDays(now, 6)),
        to: endOfDay(now)
      })
    },
    {
      label: "Last 30 Days", 
      value: "last30Days",
      description: "Sales from the past 30 days",
      getDateRange: () => ({
        from: startOfDay(subDays(now, 29)),
        to: endOfDay(now)
      })
    },
    {
      label: "This Year",
      value: "thisYear",
      description: "Sales from start of year to today",
      getDateRange: () => ({
        from: startOfYear(now),
        to: endOfDay(now)
      })
    }
  ];
};

export default function SalesDateFilter({ 
  dateRange, 
  onDateRangeChange, 
  onExportPDF, 
  onExportExcel,
  isLoading = false 
}: SalesDateFilterProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("thisMonth");
  const filterOptions = getFilterOptions();

  const handleQuickFilter = (option: FilterOption) => {
    setSelectedFilter(option.value);
    onDateRangeChange(option.getDateRange());
  };

  const handleCustomDateChange = (range: DateRange | undefined) => {
    setSelectedFilter("custom");
    onDateRangeChange(range);
  };

  const getSelectedOptionDescription = () => {
    const option = filterOptions.find(opt => opt.value === selectedFilter);
    return option?.description || "Custom date range selected";
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Sales Report Filters</span>
          <div className="flex items-center gap-2">
            {onExportExcel && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportExcel}
                disabled={isLoading}
                className="h-8 px-3"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </Button>
            )}
            {onExportPDF && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportPDF}
                disabled={isLoading}
                className="h-8 px-3"
              >
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Quick Filter Buttons */}
          <div>
            <h4 className="text-sm font-medium mb-3">Quick Filters</h4>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedFilter === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQuickFilter(option)}
                  disabled={isLoading}
                  className="h-8"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          <div>
            <h4 className="text-sm font-medium mb-3">Custom Date Range</h4>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={selectedFilter === "custom" ? "default" : "outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                  disabled={isLoading}
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
                    <span>Pick a custom date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleCustomDateChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Current Selection Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            <span>{getSelectedOptionDescription()}</span>
            {dateRange?.from && dateRange?.to && (
              <span className="font-medium">
                {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, yyyy")}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 