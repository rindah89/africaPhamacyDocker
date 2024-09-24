import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import React from "react";
import { columns } from "./columns";
import { getAllWarehouses } from "@/actions/warehouse";

export default async function page() {
  const warehouses = (await getAllWarehouses()) || [];
  return (
    <div>
      <TableHeader
        title="Warehouse"
        linkTitle="Add Warehouse"
        href="/dashboard/inventory/warehouse/new"
        data={warehouses}
        model="warehouse"
      />
      {/* <CustomDataTable categories={categories} /> */}
      <DataTable columns={columns} data={warehouses} />
    </div>
  );
}
