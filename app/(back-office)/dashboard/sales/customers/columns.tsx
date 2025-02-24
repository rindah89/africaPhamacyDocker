"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";

import ActionColumn from "@/components/DataTableColumns/ActionColumn";
import { ICustomer, OrderCustomer } from "@/types/types";
import Image from "next/image";
import { User } from "@prisma/client";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export const columns: ColumnDef<OrderCustomer>[] = [
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
    accessorKey: "profileImage",
    header: "Profile Image",
    cell: ({ row }) => {
      const customer = row.original;
      const imageUrl = customer.profileImage;
      return (
        <div className="shrink-0">
          <Image
            alt={customer.firstName}
            className="aspect-square rounded-md object-cover"
            height="50"
            src={imageUrl ?? ""}
            width="50"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => <SortableColumn column={column} title="Name" />,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <SortableColumn column={column} title="Email" />,
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <SortableColumn column={column} title=" Phone Number" />
    ),
  },

  {
    accessorKey: "phone",
    header: "Actions",
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <Button size={"sm"} asChild>
          <Link href={`/dashboard/sales/customers/${customer.id}`}>
            View Orders
          </Link>
        </Button>
      );
    },
  },
  // {
  //   accessorKey: "status",
  //   header: "Status",
  //   cell: ({ row }) => <StatusColumn row={row} accessorKey="status" />,
  // },

  // {
  //   accessorKey: "createdAt",
  //   header: "Date Created",
  //   cell: ({ row }) => <DateColumn row={row} accessorKey="createdAt" />,
  // },
  {
    id: "actions",
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <ActionColumn
          row={row}
          model="customer"
          revPath="/dashboard/sales/customers"
          editEndpoint={`/dashboard/sales/customers/update/${customer.id}`}
          id={customer.id}
        />
      );
    },
  },
];
