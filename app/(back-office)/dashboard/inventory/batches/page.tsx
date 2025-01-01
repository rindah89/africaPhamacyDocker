import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import { columns } from "./columns";
import prisma from "@/lib/db";

export default async function BatchesPage() {
  // Fetch all batches with their associated product information
  const batches = await prisma.productBatch.findMany({
    include: {
      product: {
        select: {
          name: true,
          productCode: true
        }
      }
    },
    orderBy: {
      expiryDate: 'asc'
    }
  });

  return (
    <div>
      <TableHeader
        title="Product Batches"
        linkTitle="Add Batch"
        href="/dashboard/inventory/batches/new"
        data={batches}
        model="batch"
        showPdfExport={true}
      />
      <DataTable 
        columns={columns} 
        data={batches}
        initialSorting={[{ id: "expiryDate", desc: false }]}
      />
    </div>
  );
} 