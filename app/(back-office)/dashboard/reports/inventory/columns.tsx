"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import ActionColumn from "@/components/DataTableColumns/ActionColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import { IProduct } from "@/types/types";
import { formatMoney } from "@/lib/formatMoney";
import jsPDF from "jspdf";
import 'jspdf-autotable';

// Augment jsPDF type
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => any;
  }
}

export const exportToPDF = (data: IProduct[]) => {
  const doc = new jsPDF();
  
  // Title and date
  doc.setFontSize(16);
  doc.text("Africa Pharmacy Inventory Report", 20, 20);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

  // Calculate inventory statistics
  const totalItems = data.reduce((sum, item) => sum + item.stockQty, 0);

  // Summary table
  doc.autoTable({
    startY: 50,
    head: [[{ content: 'Metric', styles: { fillColor: [39, 174, 96] } }, 
            { content: 'Value', styles: { fillColor: [39, 174, 96] } }]],
    body: [
      ['Total Items in Stock', totalItems.toLocaleString()]
    ],
    theme: 'grid',
    styles: { fontSize: 10 },
    margin: { left: 20, right: 20 }
  });

  // Detailed Inventory section
  doc.setFontSize(12);
  doc.text("Detailed Inventory", 20, 100);

  // Main inventory table
  const tableColumns = [
    "Product Name",
    "Stock Qty",
    "Supplier Price (FCFA)",
    "Selling Price (FCFA)"
  ];

  const tableRows = data.map((item) => {
    return [
      item.name,
      item.stockQty.toString(),
      item.supplierPrice.toLocaleString('en-US'),
      item.productPrice.toLocaleString('en-US')
    ];
  });

  doc.autoTable({
    startY: 120,
    head: [tableColumns],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [39, 174, 96] },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 'auto', halign: 'right' },
      2: { cellWidth: 'auto', halign: 'right' },
      3: { cellWidth: 'auto', halign: 'right' }
    },
    didDrawPage: function() {
      // Add page number at the bottom
      const pageNumber = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(10);
      doc.text(
        `Page ${pageNumber} of ${(doc as any).internal.getNumberOfPages()}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }
  });

  doc.save("inventory-report.pdf");
};

export const columns: ColumnDef<any>[] = [
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
    header: ({ column }) => (
      <SortableColumn column={column} title="Product Name" />
    ),
  },
  {
    accessorKey: "productCode",
    header: ({ column }) => (
      <SortableColumn column={column} title="Product Code" />
    ),
  },
  {
    accessorKey: "stockQty",
    header: ({ column }) => (
      <SortableColumn column={column} title="Stock Qty" />
    ),
  },
  {
    accessorKey: "supplierPrice",
    header: ({ column }) => (
      <SortableColumn column={column} title="Supplier Price" />
    ),
    cell: ({ row }) => {
      return <div>{formatMoney(row.original.supplierPrice)}</div>;
    },
  },
  {
    accessorKey: "productPrice",
    header: ({ column }) => (
      <SortableColumn column={column} title="Selling Price" />
    ),
    cell: ({ row }) => {
      return <div>{formatMoney(row.original.productPrice)}</div>;
    },
  }
];
