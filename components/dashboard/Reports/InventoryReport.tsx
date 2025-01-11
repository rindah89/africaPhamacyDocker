"use client";

import React, { useState, useMemo } from "react";
import { columns, exportToPDF } from "@/app/(back-office)/dashboard/reports/inventory/columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/formatMoney";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import DataTable from "@/components/DataTableComponents/DataTable";
import { IProduct } from "@/types/types";

interface InventoryReportProps {
  products: IProduct[];
}

export default function InventoryReport({ products }: InventoryReportProps) {
  const [selectedProducts, setSelectedProducts] = useState<IProduct[]>([]);
  
  // Sort products by name alphabetically (memoized)
  const sortedProducts = useMemo(() => 
    [...products].sort((a, b) => a.name.localeCompare(b.name)),
    [products]
  );

  // Calculate totals based on selected products or all products (memoized)
  const { totalItems, totalStockValue, totalPotentialValue, totalPotentialProfit } = useMemo(() => {
    const productsToCalculate = selectedProducts.length > 0 ? selectedProducts : sortedProducts;

    const totalItems = productsToCalculate.reduce((acc, product) => {
      return acc + product.stockQty;
    }, 0);

    const totalStockValue = productsToCalculate.reduce((acc, product) => {
      return acc + (product.stockQty * product.supplierPrice);
    }, 0);

    const totalPotentialValue = productsToCalculate.reduce((acc, product) => {
      const sellingPrice = product.batches && product.batches.length > 0
        ? product.batches[0].costPerUnit
        : product.productPrice;
      return acc + (product.stockQty * sellingPrice);
    }, 0);

    const totalPotentialProfit = totalPotentialValue - totalStockValue;

    return {
      totalItems,
      totalStockValue,
      totalPotentialValue,
      totalPotentialProfit
    };
  }, [selectedProducts, sortedProducts]);

  // Custom export function that passes selected products (memoized)
  const handleExportPDF = useMemo(() => {
    return (data: IProduct[]) => {
      exportToPDF(selectedProducts.length > 0 ? selectedProducts : data);
    };
  }, [selectedProducts]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items in Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value (Cost)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(totalStockValue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value (Selling)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(totalPotentialValue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Potential Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(totalPotentialProfit)}</div>
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
          customExportPDF={handleExportPDF}
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