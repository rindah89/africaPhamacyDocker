import DataTable from "@/components/DataTableComponents/DataTable";

import TableHeader from "@/components/dashboard/Tables/TableHeader";

import { columns } from "./columns";
import { getAllBanners } from "@/actions/banner";

export default async function page() {
  const banners = (await getAllBanners()) || [];
  return (
    <div>
      <TableHeader
        title="Banners"
        linkTitle="Add Banner"
        href="/dashboard/inventory/banners/new"
        data={banners}
        model="banner"
      />
      {/* <CustomDataTable categories={categories} /> */}
      <DataTable columns={columns} data={banners} />
    </div>
  );
}
