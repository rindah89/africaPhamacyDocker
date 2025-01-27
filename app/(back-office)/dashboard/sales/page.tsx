"use client";

import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import React, { useState, useMemo } from "react";
import { columns, exportToPDF } from "./columns";
import { getAllSales } from "@/actions/sales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/formatMoney";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { Table } from "@tanstack/react-table";

export default function SalesPage() {
  const [sales, setSales] = React.useState<any[]>([]);
  const [selectedSales, setSelectedSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [tableRef, setTableRef] = useState<Table<any>>();
  const [filteredData, setFilteredData] = useState<any[]>([]);

  React.useEffect(() => {
    const loadSales = async () => {
      const data = await getAllSales();
      setSales(data || []);
      setFilteredData(data || []);
      setIsLoading(false);
    };
    loadSales();
  }, []);

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
      const dateRange = tableRef?.getState().columnFilters.find(f => f.id === 'createdAt')?.value;
      exportToPDF(dataToExport, dateRange ? {
        from: new Date(dateRange.from),
        to: new Date(dateRange.to)
      } : undefined);
    };
  }, [selectedSales, filteredData, tableRef]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="grid gap-4 md:grid-cols-2 flex-1 mr-4">
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
        <Button 
          onClick={handleExportPDF} 
          className="flex items-center gap-2"
          variant="outline"
        >
          <FileDown className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div>
        <TableHeader
          title="Sales"
          linkTitle="Add Sale"
          href="/pos"
          data={sortedSales}
          model="sale"
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
    </div>
  );
}
