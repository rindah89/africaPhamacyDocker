import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import React from "react";
import { columns } from "./columns";
import { getAllSuppliers } from "@/actions/supplier";

export default async function page() {
  const suppliers = (await getAllSuppliers()) || [];
  return (
    <div>
      <TableHeader
        title="Suppliers"
        linkTitle="Add Supplier"
        href="/dashboard/inventory/suppliers/new"
        data={suppliers}
        model="supplier"
      />
      {/* <CustomDataTable categories={categories} /> */}
      <DataTable columns={columns} data={suppliers} />
    </div>
  );
}
