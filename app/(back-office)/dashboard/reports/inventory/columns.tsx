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
  
  // Calculate summary totals
  const totalItems = data.reduce((acc, item) => acc + item.stockQty, 0);
  const totalStockValue = data.reduce((acc, item) => acc + (item.stockQty * item.supplierPrice), 0);
  const totalPotentialValue = data.reduce((acc, item) => acc + (item.stockQty * item.productPrice), 0);
  const totalProfit = totalPotentialValue - totalStockValue;

  // Add title
  doc.setFontSize(18);
  doc.text('Karen Pharmacy Inventory Report', 14, 15);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

  // Add summary section
  doc.setFontSize(12);
  doc.text('Summary', 14, 35);

  // Create summary table with properly formatted numbers
  doc.autoTable({
    head: [['Metric', 'Value']],
    body: [
      ['Total Items in Stock', totalItems.toLocaleString()],
      ['Total Stock Value (Cost)', `${formatMoney(totalStockValue)} FCFA`],
      ['Total Stock Value (Selling)', `${formatMoney(totalPotentialValue)} FCFA`],
      ['Total Potential Profit', `${formatMoney(totalProfit)} FCFA`],
    ],
    startY: 40,
    theme: 'grid',
    headStyles: { fillColor: [34, 197, 94], textColor: 255 },
    styles: { fontSize: 10 },
    margin: { left: 14 },
    tableWidth: 100,
  });

  // Add detailed inventory table title
  doc.setFontSize(12);
  doc.text('Detailed Inventory', 14, doc.autoTable.previous.finalY + 15);

  // Add main inventory table
  const tableColumn = [
    "Product Name", 
    "Category",
    "Stock Qty", 
    "Supplier Price (FCFA)",
    "Selling Price (FCFA)",
    "Stock Value Cost (FCFA)",
    "Stock Value Selling (FCFA)",
    "Potential Profit (FCFA)"
  ];
  
  const tableRows = data.map((item) => {
    const stockValue = item.stockQty * item.supplierPrice;
    const potentialValue = item.stockQty * item.productPrice;
    const potentialProfit = potentialValue - stockValue;
    
    return [
      item.name,
      item.subCategory.title,
      item.stockQty.toLocaleString(),
      formatMoney(item.supplierPrice),
      formatMoney(item.productPrice),
      formatMoney(stockValue),
      formatMoney(potentialValue),
      formatMoney(potentialProfit),
    ];
  });

  // Add total row with properly formatted numbers
  tableRows.push([
    "TOTAL",
    "",
    totalItems.toLocaleString(),
    "",
    "",
    formatMoney(totalStockValue),
    formatMoney(totalPotentialValue),
    formatMoney(totalProfit),
  ]);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    foot: [],
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [34, 197, 94], textColor: 255 },
    footStyles: { fillColor: [34, 197, 94], textColor: 255 },
    startY: doc.autoTable.previous.finalY + 20,
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
    header: ({ column }) => (
      <SortableColumn column={column} title="Current Stock" />
    ),
  },
  {
    accessorKey: "supplierPrice",
    header: ({ column }) => (
      <SortableColumn column={column} title="Supplier Price" />
    ),
    cell: ({ row }) => {
      const product = row.original;
      return <h2>{formatMoney(product.supplierPrice)}</h2>;
    },
  },
  {
    accessorKey: "productPrice",
    header: ({ column }) => (
      <SortableColumn column={column} title="Selling Price" />
    ),
    cell: ({ row }) => {
      const product = row.original;
      return <h2>{formatMoney(product.productPrice)}</h2>;
    },
  },
  {
    accessorKey: "stockValue",
    header: ({ column }) => (
      <SortableColumn column={column} title="Stock Value (Cost)" />
    ),
    cell: ({ row }) => {
      const product = row.original;
      const stockValue = product.stockQty * product.supplierPrice;
      return <h2>{formatMoney(stockValue)}</h2>;
    },
  },
  {
    accessorKey: "potentialValue",
    header: ({ column }) => (
      <SortableColumn column={column} title="Stock Value (Selling)" />
    ),
    cell: ({ row }) => {
      const product = row.original;
      const potentialValue = product.stockQty * product.productPrice;
      return <h2>{formatMoney(potentialValue)}</h2>;
    },
  },
  {
    accessorKey: "potentialProfit",
    header: ({ column }) => (
      <SortableColumn column={column} title="Potential Profit" />
    ),
    cell: ({ row }) => {
      const product = row.original;
      const stockValue = product.stockQty * product.supplierPrice;
      const potentialValue = product.stockQty * product.productPrice;
      const potentialProfit = potentialValue - stockValue;
      return <h2>{formatMoney(potentialProfit)}</h2>;
    },
  }
];
