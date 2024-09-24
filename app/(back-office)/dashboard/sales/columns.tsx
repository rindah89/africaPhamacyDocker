"use client";

import { Checkbox } from "@/components/ui/checkbox";

import DateColumn from "@/components/DataTableColumns/DateColumn";
import ImageColumn from "@/components/DataTableColumns/ImageColumn";

import { ColumnDef } from "@tanstack/react-table";

import { Category, LineOrder, Sale } from "@prisma/client";
import ActionColumn from "@/components/DataTableColumns/ActionColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import StatusColumn from "@/components/DataTableColumns/StatusColumn";
import { ICategory, ILineOrder } from "@/types/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatMoney } from "@/lib/formatMoney";
import FormattedAmount from "@/components/frontend/FormattedAmount";
export const columns: ColumnDef<Sale>[] = [
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
    accessorKey: "customerName",
    header: ({ column }) => (
      <SortableColumn column={column} title="Customer Name" />
    ),
  },
  {
    accessorKey: "customerEmail",
    header: ({ column }) => (
      <SortableColumn column={column} title="Customer Email" />
    ),
  },
  {
    accessorKey: "productName",
    header: "Product Name",
    cell: ({ row }) => {
      const item = row.original;
      return <h2 className="truncate truncate-20">{item.productName}</h2>;
    },
  },

  {
    accessorKey: "salePrice",
    header: "Price",
    cell: ({ row }) => {
      const item = row.original;
      return <FormattedAmount amount={item.salePrice} />;
    },
  },
  // {
  //   accessorKey: "status",
  //   header: "Status",
  //   cell: ({ row }) => <StatusColumn row={row} accessorKey="status" />,
  // },

  {
    accessorKey: "createdAt",
    header: "Purchase Date",
    cell: ({ row }) => <DateColumn row={row} accessorKey="createdAt" />,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const category = row.original;
      return (
        <ActionColumn
          row={row}
          model="category"
          revPath="/dashboard/inventory/categories"
          editEndpoint={`categories/update/${category.id}`}
          id={category.id}
        />
      );
    },
  },
];
