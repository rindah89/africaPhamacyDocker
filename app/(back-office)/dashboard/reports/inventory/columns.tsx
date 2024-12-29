"use client";

import { Checkbox } from "@/components/ui/checkbox";
import DateColumn from "@/components/DataTableColumns/DateColumn";
import ImageColumn from "@/components/DataTableColumns/ImageColumn";
import { ColumnDef } from "@tanstack/react-table";
import ActionColumn from "@/components/DataTableColumns/ActionColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import StatusColumn from "@/components/DataTableColumns/StatusColumn";
import { IProduct } from "@/types/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatMoney } from "@/lib/formatMoney";
import { FileDown } from "lucide-react";
import jsPDF from "jspdf";
import 'jspdf-autotable';

// Augment jsPDF type
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const exportToPDF = (data: IProduct[]) => {
  const doc = new jsPDF();
  const tableColumn = ["Product Name", "Quantity", "Expiry Date"];
  const tableRows = data.map((item) => [
    item.name,
    item.stockQty.toString(),
    item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "N/A",
  ]);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
  });

  doc.save("inventory-report.pdf");
};

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
      const subCategory = product.subCategory.title;
      return <h2>{subCategory}</h2>;
    },
  },
  {
    accessorKey: "stockQty",
    header: "Current Stock",
    cell: ({ row }) => {
      const product = row.original;
      return <h2>{product.stockQty}</h2>;
    },
  },
  {
    accessorKey: "stockQty",
    header: "Stock Value",
    cell: ({ row }) => {
      const product = row.original;
      const value = product.stockQty * product.productPrice;
      return <h2>{formatMoney(value)}</h2>;
    },
  }
];
