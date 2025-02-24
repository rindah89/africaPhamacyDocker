import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import React from "react";
import { columns } from "./columns";
import { getOrders } from "@/actions/pos";

export default async function page() {
  const orders = (await getOrders()) || [];
  return (
    <div>
      <TableHeader
        title="Orders"
        linkTitle="Add Order"
        href="/dashboard/orders/new"
        data={orders}
        model="order"
      />
      {/* <CustomDataTable categories={categories} /> */}
      <DataTable tableTitle="orders" columns={columns} data={orders} />
    </div>
  );
}
