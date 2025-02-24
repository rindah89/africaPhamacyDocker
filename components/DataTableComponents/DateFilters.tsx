"use client";
import {
  filterByLast7Days,
  filterByThisMonth,
  filterByThisYear,
  filterByToday,
  filterByYesterday,
} from "@/lib/dateFilters";
import React, { useState } from "react";
import Select from "react-tailwindcss-select";
import { SelectValue } from "react-tailwindcss-select/dist/components/type";
import { DateRange } from "@/types";

export default function DateFilters({
  data,
  onFilter,
  setIsSearch,
  dateRange,
  onDateRangeChange,
}: {
  data: any[];
  onFilter: any;
  setIsSearch: any;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}) {
  const options = [
    { value: "life", label: "Life time" },
    { value: "today", label: "Today" },
    { value: "last-7-days", label: "Last 7 days" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This year" },
  ];
  const [selectedFilter, setSelectedFilter] = useState<SelectValue>(options[0]);

  const handleChange = (item: any) => {
    const valueString = item!.value;
    setSelectedFilter(item);
    setIsSearch(false);

    const now = new Date();
    let newDateRange: DateRange | undefined;

    if (valueString === "life") {
      newDateRange = {
        from: new Date(2000, 0, 1), // Set a far past date
        to: now
      };
      onFilter(data);
    } else if (valueString === "today") {
      newDateRange = {
        from: now,
        to: now
      };
      const filteredData = filterByToday(data);
      onFilter(filteredData);
    } else if (valueString === "yesterday") {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      newDateRange = {
        from: yesterday,
        to: yesterday
      };
      const filteredData = filterByYesterday(data);
      onFilter(filteredData);
    } else if (valueString === "last-7-days") {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      newDateRange = {
        from: sevenDaysAgo,
        to: now
      };
      const filteredData = filterByLast7Days(data);
      onFilter(filteredData);
    } else if (valueString === "month") {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      newDateRange = {
        from: firstDayOfMonth,
        to: now
      };
      const filteredData = filterByThisMonth(data);
      onFilter(filteredData);
    } else if (valueString === "year") {
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
      newDateRange = {
        from: firstDayOfYear,
        to: now
      };
      const filteredData = filterByThisYear(data);
      onFilter(filteredData);
    }

    // Update the shared date range
    onDateRangeChange(newDateRange);
  };

  return (
    <div>
      <Select
        value={selectedFilter}
        onChange={handleChange}
        options={options}
        primaryColor={"indigo"}
      />
    </div>
  );
}