"use client";

import { Checkbox } from "@/components/ui/checkbox";

import ImageColumn from "@/components/DataTableColumns/ImageColumn";

import { ColumnDef } from "@tanstack/react-table";

import ActionColumn from "@/components/DataTableColumns/ActionColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import InviteUser from "@/components/DataTableColumns/InviteUser";
import { IUser } from "@/types/types";
import UserRoleBtn from "@/components/frontend/orders/UserRoleBtn";
export const columns: ColumnDef<IUser>[] = [
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
    cell: ({ row }) => <ImageColumn row={row} accessorKey="profileImage" />,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <SortableColumn column={column} title="Name" />,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const item = row.original;
      return <UserRoleBtn user={item} />;
    },
  },
  // {
  //   accessorKey: "role",
  //   header: "Role",
  //   cell: ({ row }) => {
  //     const user = row.original;
  //     const role = user.role.displayName;
  //     return <h2>{role}</h2>;
  //   },
  // },
  {
    accessorKey: "inviteSent",
    header: "Invite",
    cell: ({ row }) => {
      const user = row.original;
      return <InviteUser user={user} />;
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => <SortableColumn column={column} title="Email" />,
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <SortableColumn column={column} title="Phone Number" />
    ),
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
      const user = row.original;
      return (
        <ActionColumn
          row={row}
          model="user"
          revPath="/dashboard/users"
          editEndpoint={`/dashboard/users/update/${user.id}`}
          id={user.id}
        />
      );
    },
  },
];
