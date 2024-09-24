import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import React from "react";
import { columns } from "./columns";
import { getAllUnits } from "@/actions/unit";
import AuthorizePageWrapper from "@/components/dashboard/Auth/AuthorizePageWrapper";
import { permissionsObj } from "@/config/permissions";

export default async function page() {
  const units = (await getAllUnits()) || [];
  return (
    <div>
      <TableHeader
        title="Units"
        model="unit"
        linkTitle="Add Unit"
        href="/dashboard/inventory/units/new"
        data={units}
      />
      {/* <CustomDataTable categories={categories} /> */}
      <DataTable columns={columns} data={units} />
    </div>
  );
}
