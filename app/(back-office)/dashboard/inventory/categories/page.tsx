import { getAllCategories } from "@/actions/category";
import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import { columns } from "./columns";

export default async function page() {
  const categories = (await getAllCategories()) || [];
  return (
    <div>
      <TableHeader
        title="Categories"
        linkTitle="Add Category"
        href="/dashboard/inventory/categories/new"
        data={categories}
        model="category"
      />
      {/* <CustomDataTable categories={categories} /> */}
      <DataTable columns={columns} data={categories} />
    </div>
  );
}
