import DataTable from "@/components/DataTableComponents/DataTable";

import TableHeader from "@/components/dashboard/Tables/TableHeader";
import { columns } from "./columns";
import { getAllAdverts } from "@/actions/advert";

export default async function page() {
  const adverts = (await getAllAdverts()) || [];
  return (
    <div>
      <TableHeader
        title="Adverts"
        linkTitle="Add Advert"
        href="/dashboard/inventory/adverts/new"
        data={adverts}
        model="advert"
      />
      {/* <CustomDataTable categories={categories} /> */}
      <DataTable columns={columns} data={adverts} />
    </div>
  );
}
