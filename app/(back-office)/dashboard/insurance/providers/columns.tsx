"use client";

import { Checkbox } from "@/components/ui/checkbox";
import DateColumn from "@/components/DataTableColumns/DateColumn";
import { ColumnDef } from "@tanstack/react-table";
import { InsuranceProvider } from "@prisma/client";
import ActionColumn from "@/components/DataTableColumns/ActionColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import StatusColumn from "@/components/DataTableColumns/StatusColumn";

export const columns: ColumnDef<InsuranceProvider>[] = [
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
    accessorKey: "name",
    header: ({ column }) => <SortableColumn column={column} title="Name" />,
  },
  {
    accessorKey: "companyName",
    header: ({ column }) => <SortableColumn column={column} title="Company" />,
  },
  {
    accessorKey: "phone",
    header: ({ column }) => <SortableColumn column={column} title="Phone" />,
  },
  {
    accessorKey: "coveragePercentage",
    header: "Coverage %",
    cell: ({ row }) => {
      const percentage = parseFloat(row.getValue("coveragePercentage") || "0");
      return <div className="text-center">{percentage}%</div>;
    },
  },
  {
    accessorKey: "city",
    header: ({ column }) => <SortableColumn column={column} title="City" />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusColumn row={row} accessorKey="status" />,
  },
  {
    accessorKey: "createdAt",
    header: "Date Created",
    cell: ({ row }) => <DateColumn row={row} accessorKey="createdAt" />,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const provider = row.original;
      return (
        <ActionColumn
          row={row}
          model="insuranceProvider"
          revPath="/dashboard/insurance/providers"
          editEndpoint={`providers/update/${provider.id}`}
          id={provider.id}
        />
      );
    },
  },
]; 