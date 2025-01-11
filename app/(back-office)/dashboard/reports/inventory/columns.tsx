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
  doc.text("Karen Pharmacy Inventory Report", 20, 20);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

  // Calculate inventory statistics
  const totalItems = data.reduce((sum, item) => sum + item.stockQty, 0);
  const totalCost = data.reduce((sum, item) => sum + (item.stockQty * item.supplierPrice), 0);
  const totalSelling = data.reduce((sum, item) => {
    const sellingPrice = item.productPrice;
    return sum + (item.stockQty * sellingPrice);
  }, 0);
  const totalProfit = totalSelling - totalCost;

  // Format currency with comma separators
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 }) + " FCFA";
  };

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
  doc.text("Detailed Inventory", 20, 100);

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
    const sellingPrice = item.productPrice;
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
    startY: 120,
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
    didDrawPage: function() {
      // Add page number at the bottom
      const pageNumber = (doc as any).internal.getNumberOfPages();
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
    accessorKey: "name",
    header: ({ column }) => (
      <SortableColumn column={column} title="Product Name" />
    ),
  },
  {
    accessorKey: "subCategory",
    header: "Category",
    cell: ({ row }) => {
      const product = row.original;
      const subCategory = product.subCategory.title;
      return <h2>{subCategory}</h2>;
    },
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
