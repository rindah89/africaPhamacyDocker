"use client";

import React, { useState, useMemo } from "react";
import { columns } from "@/app/(back-office)/dashboard/reports/inventory/columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/formatMoney";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import DataTable from "@/components/DataTableComponents/DataTable";

interface InventoryReportProps {
  products: any[];
  totals: {
    totalItems: number;
    totalStockValue: number;
    totalPotentialValue: number;
    totalPotentialProfit: number;
  };
}

export default function InventoryReport({ products, totals }: InventoryReportProps) {
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  
  // Sort products by name alphabetically (memoized)
  const sortedProducts = useMemo(() => 
    [...products].sort((a, b) => a.name.localeCompare(b.name)),
    [products]
  );

  // Calculate totals based on selected products or use provided totals
  const displayTotals = useMemo(() => {
    if (selectedProducts.length === 0) {
      return totals;
    }

    return selectedProducts.reduce((acc, product) => ({
      totalItems: acc.totalItems + product.stockQty,
      totalStockValue: acc.totalStockValue + product.stockValue,
      totalPotentialValue: acc.totalPotentialValue + product.potentialValue,
      totalPotentialProfit: acc.totalPotentialProfit + product.potentialProfit
    }), {
      totalItems: 0,
      totalStockValue: 0,
      totalPotentialValue: 0,
      totalPotentialProfit: 0
    });
  }, [selectedProducts, totals]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items in Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayTotals.totalItems.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value (Cost)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(displayTotals.totalStockValue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value (Selling)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(displayTotals.totalPotentialValue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Potential Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(displayTotals.totalPotentialProfit)}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <TableHeader
          title="Inventory Report"
          linkTitle="Add Product"
          href="/dashboard/inventory/products/new"
          data={sortedProducts}
          model="product"
          showPdfExport={true}
        />
        <DataTable 
          columns={columns} 
          data={sortedProducts}
          initialSorting={[{ id: "name", desc: false }]}
          onSelectionChange={setSelectedProducts}
        />
      </div>
    </div>
  );
} 