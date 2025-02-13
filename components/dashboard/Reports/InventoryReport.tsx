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

    return {
      totalItems: selectedProducts.reduce((acc, product) => acc + product.stockQty, 0)
    };
  }, [selectedProducts, totals]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items in Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayTotals.totalItems.toLocaleString()}</div>
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