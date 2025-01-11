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
  
  // Title and date
  doc.setFontSize(16);
  doc.text("Karen Pharmacy Inventory Report", 20, 20);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

  // Calculate inventory statistics
  const totalItems = data.reduce((sum, item) => sum + item.stockQty, 0);
  const totalCost = data.reduce((sum, item) => sum + (item.stockQty * item.supplierPrice), 0);
  const totalSelling = data.reduce((sum, item) => {
    const sellingPrice = item.batches && item.batches.length > 0 ? item.batches[0].costPerUnit : item.productPrice;
    return sum + (item.stockQty * sellingPrice);
  }, 0);
  const totalProfit = totalSelling - totalCost;

  // Format currency with comma separators
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 }) + " FCFA";
  };

  // Summary section
  doc.setFontSize(12);
  doc.text("Summary", 20, 45);

  // Summary table
  doc.autoTable({
    startY: 50,
    head: [[{ content: 'Metric', styles: { fillColor: [39, 174, 96] } }, 
            { content: 'Value', styles: { fillColor: [39, 174, 96] } }]],
    body: [
      ['Total Items in Stock', totalItems.toLocaleString()],
      ['Total Stock Value (Cost)', formatCurrency(totalCost)],
      ['Total Stock Value (Selling)', formatCurrency(totalSelling)],
      ['Total Potential Profit', formatCurrency(totalProfit)]
    ],
    theme: 'grid',
    styles: { fontSize: 10 },
    margin: { left: 20, right: 20 }
  });

  // Detailed Inventory section
  doc.setFontSize(12);
  doc.text("Detailed Inventory", 20, doc.autoTable.previous.finalY + 20);

  // Main inventory table
  const tableColumns = [
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
    const sellingPrice = item.batches && item.batches.length > 0 ? item.batches[0].costPerUnit : item.productPrice;
    const stockValueCost = item.stockQty * item.supplierPrice;
    const stockValueSelling = item.stockQty * sellingPrice;
    return [
      item.name,
      item.subCategory.title,
      item.stockQty.toString(),
      item.supplierPrice.toLocaleString('en-US'),
      sellingPrice.toLocaleString('en-US'),
      stockValueCost.toLocaleString('en-US'),
      stockValueSelling.toLocaleString('en-US'),
      (stockValueSelling - stockValueCost).toLocaleString('en-US')
    ];
  });

  doc.autoTable({
    startY: doc.autoTable.previous.finalY + 25,
    head: [tableColumns],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [39, 174, 96] },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 'auto', halign: 'right' },
      3: { cellWidth: 'auto', halign: 'right' },
      4: { cellWidth: 'auto', halign: 'right' },
      5: { cellWidth: 'auto', halign: 'right' },
      6: { cellWidth: 'auto', halign: 'right' },
      7: { cellWidth: 'auto', halign: 'right' }
    },
    didDrawPage: function(data) {
      // Add page number at the bottom
      const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
      doc.setFontSize(10);
      doc.text(
        `Page ${pageNumber}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }
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
    accessorKey: "supplierPrice",
    header: ({ column }) => (
      <SortableColumn column={column} title="Cost Price" />
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
      const sellingPrice = product.batches && product.batches.length > 0
        ? product.batches[0].costPerUnit
        : product.productPrice;
      return <h2>{formatMoney(sellingPrice)}</h2>;
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
