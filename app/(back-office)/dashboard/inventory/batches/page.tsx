import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import { columns } from "./columns";
import { getAllBatches } from "@/actions/batches";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/dashboard/ErrorBoundary";

async function BatchesContent() {
  const batches = await getAllBatches();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <TableHeader
          title="Product Batches"
          linkTitle="Add Batch"
          href="/dashboard/inventory/batches/new"
          data={batches}
          model="batch"
          showPdfExport={true}
        />
        <div className="flex gap-2">
          <Link href="/dashboard/inventory/batches/print-barcodes">
            <Button variant="outline">Print Barcodes</Button>
          </Link>
        </div>
      </div>
      <DataTable 
        columns={columns} 
        data={batches}
        initialSorting={[{ id: "expiryDate", desc: false }]}
      />
    </div>
  );
}

export default function BatchesPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading batches...</div>}>
        <BatchesContent />
      </Suspense>
    </ErrorBoundary>
  );
} 