import DataTable from "@/components/DataTableComponents/DataTable";

import TableHeader from "@/components/dashboard/Tables/TableHeader";

import { columns } from "./columns";
import { getAllMainCategories } from "@/actions/main-category";

export default async function page() {
  const mainCategories = (await getAllMainCategories()) || [];
  return (
    <div>
      <TableHeader
        title="Main Categories"
        linkTitle="Add Main Category"
        href="/dashboard/inventory/main-categories/new"
        data={mainCategories}
        model="mainCategory"
      />
      {/* <CustomDataTable categories={categories} /> */}
      <DataTable columns={columns} data={mainCategories} />
    </div>
  );
}
