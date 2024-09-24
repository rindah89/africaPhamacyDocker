import DataTable from "@/components/DataTableComponents/DataTable";

import TableHeader from "@/components/dashboard/Tables/TableHeader";

import React from "react";
import { columns } from "./columns";
import { getAllSales } from "@/actions/sales";

export default async function page() {
  const sales = (await getAllSales()) || [];
  return (
    <div>
      <TableHeader
        title="Sales"
        linkTitle="Add Sale"
        href="/pos"
        data={sales}
        model="sale"
      />
      {/* <CustomDataTable categories={categories} /> */}
      <DataTable tableTitle="sales" columns={columns} data={sales} />
    </div>
  );
}
