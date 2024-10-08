import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import React from "react";
import { columns } from "./columns";
import { getAllProducts } from "@/actions/products";
import { IProduct } from "@/types/types";

export default async function Page() {
  const products: IProduct[] = await getAllProducts();
  
  return (
    <div>
      <TableHeader
        title="Products"
        linkTitle="Add Product"
        href="/dashboard/inventory/products/new"
        data={products}
        model="product"
      />
      <DataTable columns={columns} data={products} />
    </div>
  );
}