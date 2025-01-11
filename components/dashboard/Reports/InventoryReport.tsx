"use client";

import React, { useState, useMemo } from "react";
import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import { columns } from "@/app/(back-office)/dashboard/reports/inventory/columns";
import InventoryStats from "@/components/dashboard/Stats/InventoryStats";
import { Product } from "@prisma/client";

interface InventoryReportProps {
  products: (Product & {
    batches: {
      costPerUnit: number;
      quantity: number;
      status: boolean;
    }[];
  })[];
}

export default function InventoryReport({ products }: InventoryReportProps) {
  // Sort products by name alphabetically (memoized)
  const sortedProducts = useMemo(() => 
    [...products].sort((a, b) => a.name.localeCompare(b.name)),
    [products]
  );

  // State for selected rows
  const [selectedProducts, setSelectedProducts] = useState<typeof products>([]);

  // Calculate statistics (memoized)
  const stats = useMemo(() => {
    const productsToCalculate = selectedProducts.length > 0 ? selectedProducts : sortedProducts;
    
    const totalItems = productsToCalculate.reduce((sum, product) => sum + product.stockQty, 0);
    const totalCost = productsToCalculate.reduce((sum, product) => sum + (product.stockQty * product.supplierPrice), 0);
    
    // Calculate total selling value using batch costPerUnit
    const totalSelling = productsToCalculate.reduce((sum, product) => {
      // If product has active batches, use their costPerUnit
      if (product.batches && product.batches.length > 0) {
        return sum + product.stockQty * product.batches[0].costPerUnit;
      }
      // Fallback to product's price if no batches
      return sum + product.stockQty * product.productPrice;
    }, 0);
    
    const totalProfit = totalSelling - totalCost;

    return { totalItems, totalCost, totalSelling, totalProfit };
  }, [selectedProducts, sortedProducts]);

  return (
    <div>
      <InventoryStats 
        totalItems={stats.totalItems}
        totalCost={stats.totalCost}
        totalSelling={stats.totalSelling}
        totalProfit={stats.totalProfit}
      />
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
  );
} 