import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import React from "react";
import { columns, exportToPDF } from "./columns";
import { getAllProducts } from "@/actions/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/formatMoney";

export default async function page() {
  const products = (await getAllProducts()) || [];
  
  // Sort products by name alphabetically
  const sortedProducts = [...products].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  // Calculate totals
  const totalStockValue = sortedProducts.reduce((acc, product) => {
    return acc + (product.stockQty * product.supplierPrice);
  }, 0);

  const totalPotentialValue = sortedProducts.reduce((acc, product) => {
    return acc + (product.stockQty * product.productPrice);
  }, 0);

  const totalPotentialProfit = totalPotentialValue - totalStockValue;

  const totalItems = sortedProducts.reduce((acc, product) => {
    return acc + product.stockQty;
  }, 0);

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
          customExportPDF={exportToPDF}
        />
        <DataTable 
          columns={columns} 
          data={sortedProducts}
          initialSorting={[{ id: "name", desc: false }]}
        />
      </div>
    </div>
  );
}
