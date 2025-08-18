"use client";

import { useCallback, useMemo, useState } from "react";
import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import { columns } from "../columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DateRange } from "react-day-picker";
import { ProductBatch } from "@/actions/batches";
import { useRouter } from "next/navigation";
import { useBarcodeSelection } from "@/hooks/use-barcode-selection";

export default function BatchesClient({
  initialBatches,
}: {
  initialBatches: ProductBatch[];
}) {
  const [batches] = useState<ProductBatch[]>(initialBatches);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedRows, setSelectedRows] = useState<ProductBatch[]>([]);
  const router = useRouter();
  const { clearAllBatches, addBatch } = useBarcodeSelection();

  const handleSelectionChange = useCallback((rows: ProductBatch[]) => {
    setSelectedRows(rows);
  }, []);

  const filteredBatches = useMemo(() => {
    if (!dateRange || !dateRange.from) return batches;
    const start = new Date(dateRange.from);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange.to ?? dateRange.from);
    end.setHours(23, 59, 59, 999);
    return batches.filter((b) => {
      const created = new Date(b.createdAt);
      return created >= start && created <= end;
    });
  }, [batches, dateRange]);

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
          <Button
            variant="outline"
            onClick={() => {
              const ids = selectedRows.map((r) => r.id).join(",");
              router.push(`/dashboard/inventory/batches/print-barcodes?ids=${encodeURIComponent(ids)}`);
            }}
            disabled={selectedRows.length === 0}
            title={selectedRows.length === 0 ? "Select batches first" : "Print selected barcodes"}
          >
            Print Barcodes
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <DataTable 
          columns={columns} 
          data={filteredBatches}
          initialSorting={[{ id: "createdAt", desc: true }]}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onSelectionChange={handleSelectionChange as any}
        />
      </div>

      {batches.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No batches found.</p>
          <Link href="/dashboard/inventory/batches/new">
            <Button className="mt-4">Add Your First Batch</Button>
          </Link>
        </div>
      )}
    </div>
  );
}


