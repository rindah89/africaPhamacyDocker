"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

type ProductBatch = {
  id: string;
  batchNumber: string;
  quantity: number;
  product: {
    name: string;
  };
};

export const columns: ColumnDef<ProductBatch>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
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