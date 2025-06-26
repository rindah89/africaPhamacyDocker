"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { useBarcodeSelection } from "@/hooks/use-barcode-selection";

type ProductBatch = {
  id: string;
  batchNumber: string;
  quantity: number;
  product: {
    name: string;
    productCode: string;
    productPrice: number;
    supplier?: {
      name: string;
    };
  };
  deliveryDate?: string | null;
};

// Custom hook to create columns with selection functionality
export const useBarcodeColumns = () => {
  const { selectedBatches, addBatch, removeBatch } = useBarcodeSelection();

  const columns: ColumnDef<ProductBatch>[] = [
    {
      id: "select",
      header: ({ table }) => {
        const currentPageRows = table.getRowModel().rows;
        const allCurrentPageSelected = currentPageRows.every(row => 
          selectedBatches.some(batch => batch.id === row.original.id)
        );
        const someCurrentPageSelected = currentPageRows.some(row => 
          selectedBatches.some(batch => batch.id === row.original.id)
        );

        const handleSelectAll = (checked: boolean) => {
          if (checked) {
            currentPageRows.forEach(row => {
              const batch = row.original;
              if (!selectedBatches.some(selected => selected.id === batch.id)) {
                addBatch(batch);
              }
            });
          } else {
            currentPageRows.forEach(row => {
              const batch = row.original;
              removeBatch(batch.id);
            });
          }
        };

        return (
          <Checkbox
            checked={allCurrentPageSelected || (someCurrentPageSelected && "indeterminate")}
            onCheckedChange={handleSelectAll}
            aria-label="Select all"
          />
        );
      },
      cell: ({ row }) => {
        const batch = row.original;
        const isSelected = selectedBatches.some(selected => selected.id === batch.id);

        const handleSelect = (checked: boolean) => {
          if (checked) {
            addBatch(batch);
          } else {
            removeBatch(batch.id);
          }
        };

        return (
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleSelect}
            aria-label="Select row"
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "product.name",
      header: "Product Name",
    },
    {
      accessorKey: "quantity",
      header: "Number of Tickets",
      cell: ({ row }) => {
        const quantity = row.getValue("quantity") as number;
        return <div>{quantity} tickets</div>;
      },
    },
  ];

  return columns;
}; 