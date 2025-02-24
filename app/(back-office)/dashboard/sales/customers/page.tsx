import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import { columns } from "./columns";
import { getCustomers } from "@/actions/orders";
import AuthorizePageWrapper from "@/components/dashboard/Auth/AuthorizePageWrapper";
import { permissionsObj } from "@/config/permissions";

export default async function page() {
  const customers = (await getCustomers()) || [];
  return (
    <AuthorizePageWrapper requiredPermission={permissionsObj.canViewCustomers}>
      <div>
        <TableHeader
          title="Customers"
          linkTitle="Add Customer"
          href="/dashboard/sales/customers/new"
          data={customers}
          model="customer"
        />
        {/* <CustomDataTable categories={categories} /> */}
        <DataTable columns={columns} data={customers} />
      </div>
    </AuthorizePageWrapper>
  );
}
