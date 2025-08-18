"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";

import { DataTablePagination } from "./DataTablePagination";

import SearchBar from "./SearchBar";
import { DataTableViewOptions } from "./DataTableViewOptions";
import { Button } from "../ui/button";
import { ListFilter } from "lucide-react";
import DateFilters from "./DateFilters";
import DateRangeFilter from "./DateRangeFilter";
import TableAnalytics from "./TableAnalytics";
import { DateRange } from "react-day-picker";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  tableTitle?: string;
  initialSorting?: SortingState;
  onSelectionChange?: (selectedRows: TData[]) => void;
  onTableCreated?: (table: any) => void;
  onDataFiltered?: (filteredData: TData[]) => void;
  onProcessedDataChange?: (processedData: TData[]) => void;
  dateRange?: DateRange;
  onDateRangeChange?: (dateRange: DateRange | undefined) => void;
  hideSearch?: boolean;
  hideFilters?: boolean;
}

export default function DataTable<TData, TValue>({
  columns,
  data,
  tableTitle = "",
  initialSorting = [],
  onSelectionChange,
  onTableCreated,
  onDataFiltered,
  onProcessedDataChange,
  dateRange,
  onDateRangeChange,
  hideSearch = false,
  hideFilters = false,
}: DataTableProps<TData, TValue>) {
  console.log(`🔄 DataTable (${tableTitle}): Component initializing...`);
  console.log(`🔄 DataTable (${tableTitle}): Received onDateRangeChange:`, typeof onDateRangeChange, onDateRangeChange);
  console.log(`🔄 DataTable (${tableTitle}): Received data:`, {
    dataLength: data?.length || 0,
    dataType: typeof data,
    isArray: Array.isArray(data),
    isEmpty: !data || data.length === 0,
    columnsCount: columns?.length || 0,
    tableTitle,
    firstItem: data?.[0] ? {
      keys: Object.keys(data[0]),
      hasId: 'id' in data[0],
      sample: data[0]
    } : null
  });
  
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [searchResults, setSearchResults] = useState(data);
  const [filteredData, setFilteredData] = useState(data);
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);
  const [isSearch, setIsSearch] = useState(true);

  useEffect(() => {
    console.log(`📊 DataTable (${tableTitle}): Primary data prop changed. Resetting searchResults and filteredData.`);
    setSearchResults(data);
    setFilteredData(data);
    // Clear row selection whenever the underlying data changes to avoid index mismatches
    setRowSelection({});
  }, [data, tableTitle]);

  console.log(`📊 DataTable (${tableTitle}): State initialized:`, {
    searchResultsLength: searchResults?.length || 0,
    filteredDataLength: filteredData?.length || 0,
    isSearch,
    sortingCount: sorting?.length || 0
  });

  // Update selected rows when selection changes
  useEffect(() => {
    if (!onSelectionChange) return;
    // Build selected rows list safely; filter out undefined when lists shrink
    const base = isSearch ? searchResults : filteredData;
    const selectedRows = Object.keys(rowSelection)
      .map((index) => base[parseInt(index)])
      .filter(Boolean);
    onSelectionChange(selectedRows);
  }, [rowSelection, isSearch, searchResults, filteredData, onSelectionChange]);

  const table = useReactTable({
    data: isSearch ? searchResults : filteredData,
    columns,
    state: {  
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });
  
  console.log(`📊 DataTable (${tableTitle}): Table created with:`, {
    rowCount: table.getRowModel().rows?.length || 0,
    pageCount: table.getPageCount(),
    pageSize: table.getState().pagination.pageSize,
    currentPage: table.getState().pagination.pageIndex,
    canNextPage: table.getCanNextPage(),
    canPreviousPage: table.getCanPreviousPage(),
    totalRowCount: table.getRowCount()
  });

  // Call onTableCreated when table is created
  React.useEffect(() => {
    if (onTableCreated) {
      onTableCreated(table);
    }
  }, [table, onTableCreated]);

  // Update filtered data when table data changes
  React.useEffect(() => {
    if (onDataFiltered) {
      const currentData = isSearch ? searchResults : filteredData;
      onDataFiltered(currentData);
    }
    if (onProcessedDataChange) {
      const processedRows = table.getSortedRowModel().rows.map(row => row.original);
      onProcessedDataChange(processedRows);
    }
  }, [isSearch, searchResults, filteredData, onDataFiltered, onProcessedDataChange, table]);

  console.log(`🔄 DataTable (${tableTitle}): Starting render...`);
  // Explicitly log the function just before passing it to children
  console.log(`DataTable analitycs: Prop onDateRangeChange before passing to DateRangeFilter:`, typeof onDateRangeChange, onDateRangeChange);
  const renderStartTime = Date.now();

  const tableElement = (
    <div className="space-y-4">
      {tableTitle && (
        <TableAnalytics
          tableTitle={tableTitle}
          data={isSearch ? searchResults : filteredData}
        />
      )}
      <div className="flex justify-between items-center gap-8">
        <div className="flex-1 w-full">
          {!hideSearch && (
            <SearchBar
              data={data}
              onSearch={setSearchResults}
              setIsSearch={setIsSearch}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          {!hideFilters && (
            <>
              <DateRangeFilter
                dateRange={dateRange}
                onDateRangeChange={onDateRangeChange}
              />
              <DateFilters
                dateRange={dateRange}
                onDateRangeChange={onDateRangeChange}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <ListFilter className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Filter
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem checked>
                    Active
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Archived</DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          <DataTableViewOptions table={table} />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div>
                    <div>No results.</div>
                    <div className="text-xs text-gray-400 mt-2">
                      Debug: {data?.length || 0} total items, {table.getRowModel().rows?.length || 0} filtered
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
  
  const renderTime = Date.now() - renderStartTime;
  console.log(`✅ DataTable (${tableTitle}): Render completed in ${renderTime}ms`);
  
  return tableElement;
}
