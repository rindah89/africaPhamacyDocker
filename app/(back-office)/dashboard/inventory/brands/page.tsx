import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import React from "react";
import { columns } from "./columns";
import { getAllBrands } from "@/actions/brand";

export default async function page() {
  const brands = (await getAllBrands()) || [];
  return (
    <div>
      <TableHeader
        title="Brands"
        model="brand"
        linkTitle="Add Brand"
        href="/dashboard/inventory/brands/new"
        data={brands}
      />
      {/* <CustomDataTable categories={categories} /> */}
      <DataTable columns={columns} data={brands} />
    </div>
  );
}
