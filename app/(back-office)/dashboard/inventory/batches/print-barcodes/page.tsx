'use client';

import DataTable from "@/components/DataTableComponents/DataTable";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import BarcodeSheet from "@/components/dashboard/BarcodeSheet";
import { useState } from "react";

interface PrintBarcodesPageProps {
  batches: any[];
}

export default function PrintBarcodesPage({ batches }: PrintBarcodesPageProps) {
  const [selectedBatches, setSelectedBatches] = useState<any[]>([]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Print Batch Barcodes</h1>
        <div className="text-sm text-muted-foreground">
          {selectedBatches.length} batches selected
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        <DataTable
          columns={columns}
          data={batches}
          initialSorting={[{ id: "expiryDate", desc: false }]}
          onSelectionChange={setSelectedBatches}
        />
        <BarcodeSheet selectedBatches={selectedBatches} />
      </div>
    </div>
  );
} 