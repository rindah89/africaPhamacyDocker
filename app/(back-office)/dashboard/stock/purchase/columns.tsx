"use client";

import { Checkbox } from "@/components/ui/checkbox";

import DateColumn from "@/components/DataTableColumns/DateColumn";

import { ColumnDef } from "@tanstack/react-table";

import { Adjustment, PurchaseOrder, Unit } from "@prisma/client";
import ActionColumn from "@/components/DataTableColumns/ActionColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import { IPurchaseOrder } from "@/types/types";
import OrderStatusBtn from "@/components/frontend/orders/OrderStatusBtn";
import PurchaseOrderStatus from "@/components/frontend/orders/PurchaseOrderStatus";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export const columns: ColumnDef<IPurchaseOrder>[] = [
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
    accessorKey: "refNo",
    header: ({ column }) => (
      <SortableColumn column={column} title="Reference" />
    ),
  },
  {
    accessorKey: "supplier",
    header: "Supplier",
    cell: ({ row }) => {
      const purchase = row.original;
      const supplier = purchase?.supplier?.name;
      return <h2>{supplier}</h2>;
    },
  },
  {
    accessorKey: "totalAmount",
    header: "Grand Total",
    cell: ({ row }) => {
      const purchase = row.original;
      const totalAmount = purchase?.totalAmount;
      return <h2>{totalAmount}</h2>;
    },
  },
  {
    accessorKey: "paid",
    header: "Paid",
    cell: ({ row }) => {
      const purchase = row.original;
      const paid = purchase?.totalAmount - purchase.balanceAmount;
      return <h2>{paid}</h2>;
    },
  },
  {
    accessorKey: "balanceAmount",
    header: "Due",
    cell: ({ row }) => {
      const purchase = row.original;
      const balance = purchase?.balanceAmount;
      return <h2>{balance}</h2>;
    },
  },
  {
    accessorKey: "balanceAmount",
    header: "View",
    cell: ({ row }) => {
      const purchase = row.original;
      return (
        <Button asChild variant={"outline"}>
          <Link href={`/dashboard/stock/purchase/${purchase.id}`}>
            View Details
          </Link>
        </Button>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Order status",
    cell: ({ row }) => {
      const item = row.original;
      return <PurchaseOrderStatus order={item} />;
    },
  },

  {
    accessorKey: "createdAt",
    header: "Date Created",
    cell: ({ row }) => <DateColumn row={row} accessorKey="createdAt" />,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const purchase = row.original;
      return (
        <ActionColumn
          row={row}
          model="purchaseOrder"
          revPath="/dashboard/stock/purchase"
          editEndpoint={`purchase/update/${purchase.id}`}
          id={purchase.id}
        />
      );
    },
  },
];
