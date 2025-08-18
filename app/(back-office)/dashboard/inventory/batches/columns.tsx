"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTableRowActions } from "@/components/ui/data-table-row-actions";

type ProductBatch = {
  id: string;
  batchNumber: string;
  quantity: number;
  expiryDate: Date;
  manufactureDate?: Date | null;
  costPerUnit: number;
  notes?: string | null;
  status: boolean;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
  product: {
    name: string;
    productCode: string;
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
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "product.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
    cell: ({ row }) => <div>{row.original.product.name}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "batchNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Batch Number" />
    ),
    cell: ({ row }) => <div>{row.getValue("batchNumber")}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Quantity" />
    ),
    cell: ({ row }) => <div>{row.getValue("quantity")}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "expiryDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Expiry Date" />
    ),
    cell: ({ row }) => (
      <div>
        {format(new Date(row.getValue("expiryDate")), "MMM dd, yyyy")}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "manufactureDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Manufacture Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("manufactureDate");
      return date ? (
        <div>{format(new Date(date as string), "MMM dd, yyyy")}</div>
      ) : (
        <div>-</div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => (
      <div>
        {format(new Date(row.getValue("createdAt")), "MMM dd, yyyy")}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "costPerUnit",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cost Per Unit" />
    ),
    cell: ({ row }) => (
      <div>
        {(row.getValue("costPerUnit") as number).toLocaleString("fr-CM", {
          style: "currency",
          currency: "XAF",
        })}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <Badge variant={row.getValue("status") ? "default" : "destructive"}>
        {row.getValue("status") ? "Active" : "Inactive"}
      </Badge>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]; 