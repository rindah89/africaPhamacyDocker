"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { formatMoney } from "@/lib/formatMoney";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Augment jsPDF type
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => any;
  }
}

export const exportToPDF = (data: any[]) => {
  const doc = new jsPDF();
  
  // Title and date
  doc.setFontSize(16);
  doc.text("Karen Pharmacy Sales Report", 20, 20);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

  // Calculate sales statistics
  const totals = data.reduce((acc, item) => {
    if (item.orderId !== undefined && item.orderId !== null) {
      acc.totalOrders.add(item.orderId);
    }
    acc.totalQuantity += item.quantity ?? 0;
    acc.totalRevenue += item.revenue ?? 0;
    acc.totalCost += item.cost ?? 0;
    acc.totalProfit += item.profit ?? 0;
    return acc;
  }, {
    totalOrders: new Set(),
    totalQuantity: 0,
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0
  });

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 }) + " FCFA";
  };

  // Summary table
  doc.autoTable({
    startY: 50,
    head: [[{ content: 'Metric', styles: { fillColor: [39, 174, 96] } }, 
            { content: 'Value', styles: { fillColor: [39, 174, 96] } }]],
    body: [
      ['Total Orders', (totals.totalOrders instanceof Set ? totals.totalOrders.size : 0).toString()],
      ['Total Items Sold', totals.totalQuantity.toLocaleString()],
      ['Total Revenue', formatCurrency(totals.totalRevenue)],
      ['Total Cost', formatCurrency(totals.totalCost)],
      ['Total Profit', formatCurrency(totals.totalProfit)]
    ],
    theme: 'grid',
    styles: { fontSize: 10 },
    margin: { left: 20, right: 20 }
  });

  // Detailed Sales section
  doc.setFontSize(12);
  doc.text("Detailed Sales", 20, 100);

  // Main sales table
  const tableColumns = [
    "Date",
    "Order #",
    "Customer",
    "Product",
    "Category",
    "Quantity",
    "Unit Price (FCFA)",
    "Revenue (FCFA)",
    "Profit (FCFA)"
  ];

  const tableRows = data.map((item) => [
    new Date(item.date || '').toLocaleDateString(),
    item.orderNumber || '',
    item.customerName || '',
    item.productName || '',
    item.category || '',
    (item.quantity ?? 0).toString(),
    (item.unitPrice ?? 0).toLocaleString('en-US'),
    (item.revenue ?? 0).toLocaleString('en-US'),
    (item.profit ?? 0).toLocaleString('en-US')
  ]);

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
      2: { cellWidth: 'auto' },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 'auto' },
      5: { cellWidth: 'auto', halign: 'right' },
      6: { cellWidth: 'auto', halign: 'right' },
      7: { cellWidth: 'auto', halign: 'right' },
      8: { cellWidth: 'auto', halign: 'right' }
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

  doc.save("sales-report.pdf");
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
    accessorKey: "date",
    header: ({ column }) => (
      <SortableColumn column={column} title="Date" />
    ),
    cell: ({ row }) => {
      return <div>{new Date(row.original.date).toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "orderNumber",
    header: ({ column }) => (
      <SortableColumn column={column} title="Order #" />
    ),
    cell: ({ row }) => {
      return (
        <Button variant="link" asChild>
          <Link href={`/dashboard/orders/${row.original.orderId}`}>
            {row.original.orderNumber}
          </Link>
        </Button>
      );
    },
  },
  {
    accessorKey: "customerName",
    header: ({ column }) => (
      <SortableColumn column={column} title="Customer" />
    ),
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div>
          <div>{customer.customerName}</div>
          {customer.customerPhone && (
            <div className="text-sm text-muted-foreground">{customer.customerPhone}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "productName",
    header: ({ column }) => (
      <SortableColumn column={column} title="Product" />
    ),
    cell: ({ row }) => {
      return (
        <div>
          <div>{row.original.productName}</div>
          <div className="text-sm text-muted-foreground">{row.original.productCode}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <SortableColumn column={column} title="Category" />
    ),
    cell: ({ row }) => {
      return (
        <div>
          <div>{row.original.category}</div>
          <div className="text-sm text-muted-foreground">{row.original.subCategory}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "brand",
    header: ({ column }) => (
      <SortableColumn column={column} title="Brand" />
    ),
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <SortableColumn column={column} title="Quantity" />
    ),
  },
  {
    accessorKey: "unitPrice",
    header: ({ column }) => (
      <SortableColumn column={column} title="Unit Price" />
    ),
    cell: ({ row }) => {
      return <div>{formatMoney(row.original.unitPrice)}</div>;
    },
  },
  {
    accessorKey: "revenue",
    header: ({ column }) => (
      <SortableColumn column={column} title="Revenue" />
    ),
    cell: ({ row }) => {
      return <div>{formatMoney(row.original.revenue)}</div>;
    },
  },
  {
    accessorKey: "cost",
    header: ({ column }) => (
      <SortableColumn column={column} title="Cost" />
    ),
    cell: ({ row }) => {
      return <div>{formatMoney(row.original.cost)}</div>;
    },
  },
  {
    accessorKey: "profit",
    header: ({ column }) => (
      <SortableColumn column={column} title="Profit" />
    ),
    cell: ({ row }) => {
      return <div>{formatMoney(row.original.profit)}</div>;
    },
  }
]; 