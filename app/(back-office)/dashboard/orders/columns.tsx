"use client";

import { Checkbox } from "@/components/ui/checkbox";

import DateColumn from "@/components/DataTableColumns/DateColumn";
import ImageColumn from "@/components/DataTableColumns/ImageColumn";

import { ColumnDef } from "@tanstack/react-table";

import { Category, LineOrder } from "@prisma/client";
import ActionColumn from "@/components/DataTableColumns/ActionColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import StatusColumn from "@/components/DataTableColumns/StatusColumn";
import { ICategory, ILineOrder } from "@/types/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import OrderStatusBtn from "@/components/frontend/orders/OrderStatusBtn";
import FormattedAmount from "@/components/frontend/FormattedAmount";
export const columns: ColumnDef<LineOrder>[] = [
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
    accessorKey: "orderNumber",
    header: ({ column }) => (
      <SortableColumn column={column} title="Order Number" />
    ),
  },
  {
    accessorKey: "customerName",
    header: ({ column }) => (
      <SortableColumn column={column} title="Customer Name" />
    ),
  },
  {
    accessorKey: "status",
    header: "Order status",
    cell: ({ row }) => {
      const item = row.original;
      return <OrderStatusBtn order={item} />;
    },
  },
  {
    accessorKey: "orderAmount",
    header: "Order Amount",
    cell: ({ row }) => {
      const item = row.original;
      return <FormattedAmount amount={item?.orderAmount ?? 0} />;
    },
  },
  {
    accessorKey: "orderAmount",
    header: "Order Amount",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="">
          <Button asChild>
            <Link href={`/dashboard/orders/${order.id}`}>View Order</Link>
          </Button>
        </div>
      );
    },
  },
  // {
  //   accessorKey: "status",
  //   header: "Status",
  //   cell: ({ row }) => <StatusColumn row={row} accessorKey="status" />,
  // },

  {
    accessorKey: "createdAt",
    header: "Order Date",
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
