import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import React from "react";
import { columns } from "./columns";
import { getAllUnits } from "@/actions/unit";
import AuthorizePageWrapper from "@/components/dashboard/Auth/AuthorizePageWrapper";
import { permissionsObj } from "@/config/permissions";
import { getAdjustments } from "@/actions/adjustments";

export default async function page() {
  const adjustments = (await getAdjustments()) || [];
  return (
    <div>
      <TableHeader
        title="Adjustments"
        model="adjustment"
        linkTitle="Add Adjustment"
        href="/dashboard/stock/adjustment/new"
        data={adjustments}
      />
      {/* <CustomDataTable categories={categories} /> */}
      <DataTable columns={columns} data={adjustments} />
    </div>
  );
}
