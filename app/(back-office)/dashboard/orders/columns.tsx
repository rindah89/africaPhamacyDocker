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
import PaymentMethodBtn from "@/components/frontend/orders/PaymentMethodBtn"; // Add this import

export const columns: ColumnDef<LineOrder>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="text-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "orderNumber",
    header: ({ column }) => (
      <div className="text-center">
        <SortableColumn column={column} title="Order #" />
      </div>
    ),
    cell: ({ row }) => {
      const orderNumber = row.getValue("orderNumber") as string;
      return (
        <div className="text-center max-w-[100px] truncate mx-auto" title={orderNumber}>
          {orderNumber}
        </div>
      );
    },
  },
  {
    accessorKey: "customerName",
    header: ({ column }) => (
      <div className="text-center">
        <SortableColumn column={column} title="Customer Name" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("customerName")}</div>
    ),
  },
  {
    accessorKey: "orderAmount",
    header: ({ column }) => (
      <div className="text-center">
        <SortableColumn column={column} title="Order Amount" />
      </div>
    ),
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="text-center">
          <FormattedAmount amount={item?.orderAmount ?? 0} />
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <div className="text-center">
        <SortableColumn column={column} title="Status" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <OrderStatusBtn order={row.original} />
      </div>
    ),
  },
  {
    accessorKey: "paymentMethod",
    header: ({ column }) => (
      <div className="text-center">
        <SortableColumn column={column} title="Payment Method" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <PaymentMethodBtn order={row.original} />
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <div className="text-center">
        <SortableColumn column={column} title="Order Date" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <DateColumn row={row} accessorKey="createdAt" />
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="flex justify-center space-x-2">
          <Button asChild size="sm">
            <Link href={`/dashboard/orders/${order.id}`}>View</Link>
          </Button>
          <ActionColumn
            row={row}
            model="order"
            revPath="/dashboard/orders"
            editEndpoint={`orders/update/${order.id}`}
            id={order.id}
          />
        </div>
      );
    },
  },
];
