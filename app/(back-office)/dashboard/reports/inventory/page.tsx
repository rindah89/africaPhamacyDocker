import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import React from "react";
import { columns } from "./columns";
import { getAllProducts } from "@/actions/products";

export default async function page() {
  const products = (await getAllProducts()) || [];
  
  // Sort products by name alphabetically
  const sortedProducts = [...products].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  return (
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
      />
    </div>
  );
}
