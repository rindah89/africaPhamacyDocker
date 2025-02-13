"use client";

import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useReactToPrint } from 'react-to-print';
import { formatCurrency } from '@/lib/utils';
import dynamic from 'next/dynamic';
import type { PDFDownloadLinkProps } from '@react-pdf/renderer';
import { BlobProvider } from '@react-pdf/renderer';

const PDFDownloadLink = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink), {
  ssr: false,
  loading: () => <Button disabled>Loading PDF...</Button>
});

const ShiftReportPDF = dynamic(() => import('./ShiftReportPDF').then(mod => mod.ShiftReportPDF), {
  ssr: false
});

interface Sale {
  id: string;
  productName: string;
  qty: number;
  salePrice: number;
  customerName: string;
  paymentMethod: string;
  createdAt: string;
  orderNumber?: string;
}

interface ShiftReportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: {
    id: string;
    name: string;
    startTime: string;
    endTime?: string;
  };
  sales: Sale[];
}

export default function ShiftReport({ open, onOpenChange, shift, sales }: ShiftReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
  });

  // Calculate totals
  const totalSales = sales.reduce((sum, sale) => sum + (sale.salePrice * sale.qty), 0);
  const totalItems = sales.reduce((sum, sale) => sum + sale.qty, 0);
  const uniqueCustomers = new Set(sales.map(sale => sale.customerName)).size;

  // Group sales by payment method
  const salesByPaymentMethod = sales.reduce((acc, sale) => {
    const method = sale.paymentMethod || 'NONE';
    if (!acc[method]) {
      acc[method] = 0;
    }
    acc[method] += sale.salePrice * sale.qty;
    return acc;
  }, {} as Record<string, number>);

  // Group sales by order
  const salesByOrder = sales.reduce((acc, sale) => {
    const orderNumber = sale.orderNumber || 'N/A';
    if (!acc[orderNumber]) {
      acc[orderNumber] = {
        items: [],
        total: 0,
        customerName: sale.customerName,
        paymentMethod: sale.paymentMethod,
        time: sale.createdAt
      };
    }
    acc[orderNumber].items.push(sale);
    acc[orderNumber].total += sale.salePrice * sale.qty;
    return acc;
  }, {} as Record<string, any>);

  // Calculate product summary
  const productSummary = sales.reduce((acc, sale) => {
    const productName = sale.productName;
    if (!acc[productName]) {
      acc[productName] = {
        qty: 0,
        total: 0,
        avgPrice: sale.salePrice
      };
    }
    acc[productName].qty += sale.qty;
    acc[productName].total += sale.salePrice * sale.qty;
    return acc;
  }, {} as Record<string, { qty: number; total: number; avgPrice: number }>);

  // Sort products by total sales amount
  const sortedProducts = Object.entries(productSummary)
    .sort(([, a], [, b]) => b.total - a.total);

  const ReportContent = () => (
    <div className="p-6" ref={reportRef}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Shift Report</h2>
        <p className="text-muted-foreground">
          {new Date(shift.startTime).toLocaleString()} - {shift.endTime ? new Date(shift.endTime).toLocaleString() : 'Ongoing'}
        </p>
        <p className="font-medium">Cashier: {shift.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-secondary p-4 rounded-lg">
          <h3 className="font-bold">Total Sales</h3>
          <p className="text-2xl">{formatCurrency(totalSales)}</p>
        </div>
        <div className="bg-secondary p-4 rounded-lg">
          <h3 className="font-bold">Items Sold</h3>
          <p className="text-2xl">{totalItems}</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-2">Payment Methods</h3>
        <div className="space-y-2">
          {Object.entries(salesByPaymentMethod).map(([method, amount]) => (
            <div key={method} className="flex justify-between border-b pb-1">
              <span>{method}</span>
              <span>{formatCurrency(amount)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-2">Itemized Sales</h3>
        <div className="space-y-6">
          {Object.entries(salesByOrder).map(([orderNumber, order]) => (
            <div key={orderNumber} className="border rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <div>
                  <span className="font-medium">Order: {orderNumber}</span>
                  <p className="text-sm text-muted-foreground">
                    Customer: {order.customerName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Time: {new Date(order.time).toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Payment: {order.paymentMethod}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold">{formatCurrency(order.total)}</span>
                </div>
              </div>
              <table className="w-full mt-2">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-right">Qty</th>
                    <th className="p-2 text-right">Price</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item: Sale) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-2">{item.productName}</td>
                      <td className="p-2 text-right">{item.qty}</td>
                      <td className="p-2 text-right">{formatCurrency(item.salePrice)}</td>
                      <td className="p-2 text-right">{formatCurrency(item.salePrice * item.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 border-t-2 pt-6">
        <h3 className="text-xl font-bold mb-4">Shift Summary</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-secondary p-4 rounded-lg">
            <h4 className="font-bold">Total Orders</h4>
            <p className="text-xl">{Object.keys(salesByOrder).length}</p>
          </div>
          <div className="bg-secondary p-4 rounded-lg">
            <h4 className="font-bold">Average Order Value</h4>
            <p className="text-xl">
              {formatCurrency(totalSales / Object.keys(salesByOrder).length || 0)}
            </p>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <h4 className="font-bold p-4 bg-secondary">Product Summary</h4>
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-right">Quantity</th>
                <th className="p-2 text-right">Unit Price</th>
                <th className="p-2 text-right">Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map(([productName, data]) => (
                <tr key={productName} className="border-t">
                  <td className="p-2">{productName}</td>
                  <td className="p-2 text-right">{data.qty}</td>
                  <td className="p-2 text-right">{formatCurrency(data.avgPrice)}</td>
                  <td className="p-2 text-right">{formatCurrency(data.total)}</td>
                </tr>
              ))}
              <tr className="border-t font-bold bg-secondary/20">
                <td className="p-2">Total</td>
                <td className="p-2 text-right">{totalItems}</td>
                <td className="p-2 text-right">-</td>
                <td className="p-2 text-right">{formatCurrency(totalSales)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-muted-foreground text-center mt-6 border-t pt-4">
        <p>Total Customers Served: {uniqueCustomers}</p>
        <p>Total Orders: {Object.keys(salesByOrder).length}</p>
        <p>Average Order Value: {formatCurrency(totalSales / Object.keys(salesByOrder).length || 0)}</p>
        <p>Report Generated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Shift Report</span>
            <div className="flex gap-2">
              <Button onClick={handlePrint}>Print Report</Button>
              <BlobProvider
                document={
                  <ShiftReportPDF
                    shift={shift}
                    sales={sales}
                    totalSales={totalSales}
                    totalItems={totalItems}
                    uniqueCustomers={uniqueCustomers}
                    salesByPaymentMethod={salesByPaymentMethod}
                    salesByOrder={salesByOrder}
                    sortedProducts={sortedProducts}
                  />
                }
              >
                {({ blob, url, loading }) => (
                  <Button 
                    disabled={loading}
                    onClick={() => {
                      if (url) {
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `shift-report-${shift.id}.pdf`;
                        link.click();
                      }
                    }}
                  >
                    {loading ? 'Generating PDF...' : 'Download PDF'}
                  </Button>
                )}
              </BlobProvider>
            </div>
          </DialogTitle>
        </DialogHeader>
        <ReportContent />
      </DialogContent>
    </Dialog>
  );
} 