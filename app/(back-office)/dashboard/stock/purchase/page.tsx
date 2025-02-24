import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import React from "react";
import { columns } from "./columns";
import { getAllUnits } from "@/actions/unit";
import AuthorizePageWrapper from "@/components/dashboard/Auth/AuthorizePageWrapper";
import { permissionsObj } from "@/config/permissions";
import { getAdjustments } from "@/actions/adjustments";
import { getPurchaseOrders } from "@/actions/purchases";

export default async function page() {
  const purchases = (await getPurchaseOrders()) || [];
  return (
    <div>
      <TableHeader
        title="Purchase Orders"
        model="purchaseOrder"
        linkTitle="Add Purchase Order"
        href="/dashboard/stock/purchase/new"
        data={purchases}
      />
      {/* <CustomDataTable categories={categories} /> */}
      <DataTable columns={columns} data={purchases} />
    </div>
  );
}
