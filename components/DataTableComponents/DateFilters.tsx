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
  // data, // Not needed for date range selection logic anymore
  // onFilter, // Parent handles data fetching based on dateRangeChange
  // setIsSearch, // Parent handles search state changes
  // dateRange, // The current dateRange prop isn't actively used by this component to display, only to set
  onDateRangeChange,
}: {
  // data: any[];
  // onFilter: any;
  // setIsSearch: any;
  // dateRange: DateRange | undefined; // Keep if needed for visual feedback, but primary is onDateRangeChange
  onDateRangeChange: (range: DateRange | undefined) => void;
}) {
  const options = [
    { value: "life", label: "Life time" },
    { value: "today", label: "Today" },
    { value: "last-7-days", label: "Last 7 days" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This year" },
  ];
  // Internal state for the select component's current value
  const [selectedUIFilter, setSelectedUIFilter] = useState<SelectValue>(options[0]);

  const handleChange = (item: any) => {
    const valueString = item!.value;
    setSelectedUIFilter(item); // Update UI state for the select component
    // setIsSearch(false); // Parent will manage this

    const now = new Date();
    let newDateRange: DateRange | undefined;

    if (valueString === "life") {
      newDateRange = undefined; // Correctly set to undefined for "Life time"
      // onFilter(data); // Remove client-side filtering
    } else if (valueString === "today") {
      newDateRange = {
        from: now,
        to: now
      };
      // const filteredData = filterByToday(data); // Remove
      // onFilter(filteredData); // Remove
    } else if (valueString === "yesterday") { // Note: "yesterday" was not in your options, but logic existed.
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      newDateRange = {
        from: yesterday,
        to: yesterday
      };
      // const filteredData = filterByYesterday(data); // Remove
      // onFilter(filteredData); // Remove
    } else if (valueString === "last-7-days") {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      newDateRange = {
        from: sevenDaysAgo,
        to: now
      };
      // const filteredData = filterByLast7Days(data); // Remove
      // onFilter(filteredData); // Remove
    } else if (valueString === "month") {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      newDateRange = {
        from: firstDayOfMonth,
        to: now
      };
      // const filteredData = filterByThisMonth(data); // Remove
      // onFilter(filteredData); // Remove
    } else if (valueString === "year") {
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
      newDateRange = {
        from: firstDayOfYear,
        to: now
      };
      // const filteredData = filterByThisYear(data); // Remove
      // onFilter(filteredData); // Remove
    }

    onDateRangeChange(newDateRange); // Notify parent of the new date range
  };

  return (
    <div>
      <Select
        value={selectedUIFilter} // Use internal state for select UI
        onChange={handleChange}
        options={options}
        primaryColor={"indigo"}
      />
    </div>
  );
}