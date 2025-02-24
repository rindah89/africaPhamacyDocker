import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import React from "react";
import { columns } from "./columns";
import { getAllSubCategories } from "@/actions/sub-category";

export default async function page() {
  const subCategories = (await getAllSubCategories()) || [];
  return (
    <div>
      <TableHeader
        title="Sub Categories"
        linkTitle="Add Sub Category"
        href="/dashboard/inventory/sub-categories/new"
        data={subCategories}
        model="subCategory"
      />
      {/* <CustomDataTable categories={categories} /> */}
      <DataTable columns={columns} data={subCategories} />
    </div>
  );
}
