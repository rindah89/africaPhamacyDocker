"use client";

import { Checkbox } from "@/components/ui/checkbox";
import DateColumn from "@/components/DataTableColumns/DateColumn";
import ImageColumn from "@/components/DataTableColumns/ImageColumn";
import { ColumnDef } from "@tanstack/react-table";
import ActionColumn from "@/components/DataTableColumns/ActionColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import StatusColumn from "@/components/DataTableColumns/StatusColumn";
import { IProduct } from "@/types/types";  // Make sure this path is correct
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const columns: ColumnDef<IProduct>[] = [
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
    accessorKey: "productThumbnail",
    header: "Product Image",
    cell: ({ row }) => <ImageColumn row={row} accessorKey="productThumbnail" />,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortableColumn column={column} title="Product Name" />
    ),
  },
  {
    accessorKey: "subCategory",
    header: "Sub Category",
    cell: ({ row }) => {
      const product = row.original;
      return <h2>{product.subCategory.title}</h2>;
    },
  },
  {
    accessorKey: "stockQty",
    header: "Stock",
    cell: ({ row }) => {
      const product = row.original;
      return <h2>{product.stockQty}</h2>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusColumn row={row} accessorKey="status" />,
  },
  {
    accessorKey: "shelfNo",
    header: "Shelf No",
    cell: ({ row }) => {
      const product = row.original;
      return <h2>{product.shelfNo || 'N/A'}</h2>;
    },
  },
  {
    accessorKey: "dosage",
    header: "Dosage",
    cell: ({ row }) => {
      const product = row.original;
      return <h2>{product.dosage || 'N/A'}</h2>;
    },
  },
  
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <ActionColumn
          row={row}
          model="product"
          revPath="/dashboard/inventory/products"
          editEndpoint={`products/update/${product.id}`}
          id={product.id}
        />
      );
    },
  },
  {
    accessorKey: "id",
    header: "View",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <Button asChild variant={"outline"} size={"sm"}>
          <Link href={`/dashboard/inventory/products/${product.id}`}>
            View
          </Link>
        </Button>
      );
    },
  },
];