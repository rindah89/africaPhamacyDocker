import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import { columns } from "./columns";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function fixBatches() {
  'use server'
  const response = await fetch('/api/fix-batches', {
    method: 'POST'
  });
  return response.json();
}

export default async function BatchesPage() {
  try {
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

    // Filter out any batches with null products to prevent UI errors
    const validBatches = batches.filter(batch => batch.product !== null);

    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <TableHeader
            title="Product Batches"
            linkTitle="Add Batch"
            href="/dashboard/inventory/batches/new"
            data={validBatches}
            model="batch"
            showPdfExport={true}
          />
          <div className="flex gap-2">
            <Link href="/dashboard/inventory/batches/print-barcodes">
              <Button variant="outline">
                Print Barcodes
              </Button>
            </Link>
            <form action={fixBatches}>
              <Button type="submit" variant="destructive">
                Fix Orphaned Batches
              </Button>
            </form>
          </div>
        </div>
        <DataTable 
          columns={columns} 
          data={validBatches}
          initialSorting={[{ id: "expiryDate", desc: false }]}
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading batches:", error);
    return <div>Error loading batches. Please try again.</div>;
  }
} 