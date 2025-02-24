import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import React from "react";
import { columns } from "./columns";
import { getAllRoles } from "@/actions/roles";

export default async function page() {
  const roles = (await getAllRoles()) || [];
  return (
    <div>
      <TableHeader
        title="Roles"
        model="role"
        linkTitle="Add Role"
        href="/dashboard/users/roles/new"
        data={roles}
        showImport={false}
      />
      {/* <CustomDataTable categories={categories} /> */}
      <DataTable columns={columns} data={roles} />
    </div>
  );
}
