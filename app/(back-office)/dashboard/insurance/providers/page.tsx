import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import React from "react";
import { columns } from "./columns";
import { getAllInsuranceProviders } from "@/actions/insurance";

export default async function page() {
  const providers = (await getAllInsuranceProviders(true)) || [];
  return (
    <div>
      <TableHeader
        title="Insurance Providers"
        linkTitle="Add Insurance Provider"
        href="/dashboard/insurance/providers/new"
        data={providers}
        model="insuranceProvider"
      />
      <DataTable columns={columns} data={providers} />
    </div>
  );
} 