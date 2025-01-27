"use client";

import { Checkbox } from "@/components/ui/checkbox";

import DateColumn from "@/components/DataTableColumns/DateColumn";
import ImageColumn from "@/components/DataTableColumns/ImageColumn";

import { ColumnDef } from "@tanstack/react-table";

import { Category, LineOrder, Sale } from "@prisma/client";
import ActionColumn from "@/components/DataTableColumns/ActionColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import StatusColumn from "@/components/DataTableColumns/StatusColumn";
import { ICategory, ILineOrder } from "@/types/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatMoney } from "@/lib/formatMoney";
import FormattedAmount from "@/components/frontend/FormattedAmount";
import { formatDate } from "@/lib/formatDate";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';

export const columns: ColumnDef<Sale>[] = [
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
    accessorKey: "customerName",
    header: ({ column }) => (
      <SortableColumn column={column} title="Customer Name" />
    ),
  },
  {
    accessorKey: "customerEmail",
    header: ({ column }) => (
      <SortableColumn column={column} title="Customer Email" />
    ),
  },
  {
    accessorKey: "productName",
    header: "Product Name",
    cell: ({ row }) => {
      const item = row.original;
      return <h2 className="truncate truncate-20">{item.productName}</h2>;
    },
  },

  {
    accessorKey: "salePrice",
    header: "Price",
    cell: ({ row }) => {
      const item = row.original;
      return <FormattedAmount amount={item.salePrice} />;
    },
  },
  // {
  //   accessorKey: "status",
  //   header: "Status",
  //   cell: ({ row }) => <StatusColumn row={row} accessorKey="status" />,
  // },

  {
    accessorKey: "createdAt",
    header: "Purchase Date",
    cell: ({ row }) => <DateColumn row={row} accessorKey="createdAt" />,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const category = row.original;
      return (
        <ActionColumn
          row={row}
          model="category"
          revPath="/dashboard/inventory/categories"
          editEndpoint={`categories/update/${category.id}`}
          id={category.id}
        />
      );
    },
  },
];

export const exportToPDF = (data: any[], dateRange?: { from: Date; to: Date }) => {
  const doc = new jsPDF();
  
  // Calculate totals first
  const totalSales = data.reduce((sum, sale) => sum + (sale.salePrice * sale.qty), 0);
  const totalItems = data.reduce((sum, sale) => sum + sale.qty, 0);
  
  // Add title
  doc.setFontSize(18);
  doc.text("Sales Report", 14, 22);
  
  // Add metadata and date range
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  if (dateRange) {
    const fromDate = formatDate(dateRange.from);
    const toDate = formatDate(dateRange.to);
    doc.text(`Period: ${fromDate} to ${toDate}`, 14, 36);
    doc.text(`Total Sales: ${formatMoney(totalSales)}`, 14, 42);
    doc.text(`Total Items Sold: ${totalItems}`, 14, 48);
  } else {
    doc.text(`Total Sales: ${formatMoney(totalSales)}`, 14, 36);
    doc.text(`Total Items Sold: ${totalItems}`, 14, 42);
  }
  
  // Prepare table data
  const tableData = data.map(sale => [
    formatDate(sale.createdAt),
    sale.productName,
    sale.qty.toString(),
    formatMoney(sale.salePrice),
    formatMoney(sale.salePrice * sale.qty),
    sale.customerName || 'N/A'
  ]);
  
  // Add table
  autoTable(doc, {
    head: [['Date', 'Product', 'Quantity', 'Unit Price', 'Total', 'Customer']],
    body: tableData,
    startY: dateRange ? 54 : 48,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
  });
  
  // Save the PDF with date range in filename if present
  const filename = dateRange 
    ? `sales-report-${formatDate(dateRange.from).split(' ')[0]}-to-${formatDate(dateRange.to).split(' ')[0]}.pdf`
    : 'sales-report.pdf';
  doc.save(filename);
};
