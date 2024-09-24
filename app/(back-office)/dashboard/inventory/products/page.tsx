import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import React from "react";
import { columns } from "./columns";
import { getAllProducts } from "@/actions/products";

export default async function page() {
  const products = (await getAllProducts()) || [];
  return (
    <div>
      <TableHeader
        title="Products"
        linkTitle="Add Product"
        href="/dashboard/inventory/products/new"
        data={products}
        model="product"
      />
      {/* <CustomDataTable categories={categories} /> */}
      <DataTable columns={columns} data={products} />
    </div>
  );
}
