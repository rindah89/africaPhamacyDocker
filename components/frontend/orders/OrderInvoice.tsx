"use client";
import Logo from "@/components/global/Logo";
import { ILineOrder } from "@/types/types";
import Image from "next/image";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useReactToPrint } from "react-to-print";
import { convertIsoToDateString } from "@/lib/covertDateToDateString";
import { numberToWords } from "@/lib/numberToWords";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function OrderInvoice({ order, readOnly = true }: { order: ILineOrder; readOnly?: boolean }) {
  const [customerName, setCustomerName] = useState(order.firstName || "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const totalSum = order.lineOrderItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const currentDate = convertIsoToDateString(order.createdAt);
  const componentRef = React.useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Order-${order.orderNumber}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 15mm 12mm 15mm 12mm;
        padding: 0;
      }
      @media print {
        html, body {
          width: 210mm;
          height: 297mm;
          margin: 0 !important;
          padding: 0 !important;
          overflow: visible !important;
          font-size: 12px !important;
          line-height: 1.4 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }

        /* Ensure the print root is not constrained by screen max-width containers */
        .invoice-print-root {
          width: 210mm !important;
          max-width: 210mm !important;
          margin: 0 auto !important;
          padding: 0 !important;
          background: white !important;
        }

        /* Neutralize Tailwind max-width wrappers inside the print root */
        .invoice-print-root .max-w-5xl,
        .invoice-print-root .max-w-2xl {
          max-width: none !important;
          width: auto !important;
        }
        
        * {
          color: black !important;
          background: white !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
          box-shadow: none !important;
          text-shadow: none !important;
        }
        
        /* Hide non-print elements */
        .print\\:hidden,
        button:not(.print-show),
        [data-print="hidden"] {
          display: none !important;
        }
        
        /* Invoice container optimization */
        .invoice-container {
          width: 186mm !important;
          max-width: 186mm !important;
          margin: 0 auto !important;
          padding: 8mm 0 !important;
          font-size: 11px !important;
        }
        
        /* Header section */
        .invoice-header {
          text-align: center !important;
          margin-bottom: 8mm !important;
          page-break-inside: avoid !important;
        }
        
        .invoice-title {
          font-size: 18px !important;
          font-weight: bold !important;
          margin: 4mm 0 !important;
          color: #166534 !important;
        }
        
        .company-info {
          font-size: 9px !important;
          color: #666666 !important;
          margin: 2mm 0 !important;
        }
        
        .order-details {
          font-size: 10px !important;
          margin: 4mm 0 !important;
          text-align: left !important;
        }
        
        /* Table improvements */
        .invoice-table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 4mm 0 !important;
          font-size: 9px !important;
        }
        
        .invoice-table th,
        .invoice-table td {
          padding: 2mm !important;
          border: 0.5px solid #cccccc !important;
          text-align: left !important;
          vertical-align: top !important;
        }
        
        .invoice-table th {
          background-color: #f5f5f5 !important;
          font-weight: bold !important;
          color: black !important;
        }
        
        /* Product items section */
        .product-items {
          margin: 6mm 0 !important;
          page-break-inside: auto !important;
        }
        
        .product-item {
          display: flex !important;
          padding: 2mm 0 !important;
          border-bottom: 0.5px solid #e5e5e5 !important;
          page-break-inside: avoid !important;
          align-items: flex-start !important;
        }
        
        .product-item img {
          width: 12mm !important;
          height: 12mm !important;
          object-fit: cover !important;
          margin-right: 3mm !important;
          flex-shrink: 0 !important;
        }
        
        .product-details {
          flex-grow: 1 !important;
          font-size: 10px !important;
        }
        
        .product-name {
          font-weight: bold !important;
          margin-bottom: 1mm !important;
          color: black !important;
        }
        
        .product-price-qty {
          font-size: 9px !important;
          color: #666666 !important;
        }
        
        .product-total {
          text-align: right !important;
          font-weight: bold !important;
          min-width: 20mm !important;
        }
        
        /* Totals section */
        .totals-section {
          margin-top: 6mm !important;
          padding-top: 4mm !important;
          border-top: 1px solid #cccccc !important;
        }
        
        .total-line {
          display: flex !important;
          justify-content: space-between !important;
          margin: 1mm 0 !important;
          font-size: 10px !important;
        }
        
        .total-line.final-total {
          font-weight: bold !important;
          font-size: 12px !important;
          border-top: 1px solid #cccccc !important;
          padding-top: 2mm !important;
          margin-top: 3mm !important;
        }
        
        /* Amount in words */
        .amount-words {
          font-style: italic !important;
          font-size: 9px !important;
          margin-top: 3mm !important;
          color: #666666 !important;
        }
        
        /* Page breaks */
        .page-break-before {
          page-break-before: always !important;
        }
        
        .page-break-after {
          page-break-after: always !important;
        }
        
        .page-break-avoid {
          page-break-inside: avoid !important;
        }
        
        /* Status badges - convert to text for print */
        .status-badge,
        .payment-badge {
          display: inline-block !important;
          padding: 1mm 2mm !important;
          border: 0.5px solid #cccccc !important;
          border-radius: 0 !important;
          font-size: 8px !important;
          font-weight: normal !important;
          background: white !important;
          color: black !important;
        }
      }
    `,
    onBeforePrint: async () => {
      console.log("Preparing to print...");
    },
    onPrintError: (error) => {
      console.error("Print error:", error);
      alert("There was an error printing. Please try again.");
    }
  });

  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case 'MOBILE_MONEY':
        return 'Mobile Money';
      case 'CASH':
        return 'Cash';
      case 'INSURANCE':
        return 'Insurance';
      case 'ORANGE_MONEY':
        return 'Orange Money';
      default:
        return method;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'MOBILE_MONEY':
        return 'bg-yellow-200';
      case 'CASH':
        return 'bg-green-200';
      case 'INSURANCE':
        return 'bg-blue-200';
      case 'ORANGE_MONEY':
        return 'bg-orange-200';
      default:
        return 'bg-gray-200';
    }
  };

  const handlePrintWithName = () => {
    setIsModalOpen(false);
    // Small delay to ensure modal is closed and DOM is updated
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  const handleDownloadPDF = async () => {
    setIsModalOpen(false);
    
    // Wait for modal to close
    setTimeout(async () => {
      try {
        const element = componentRef.current;
        if (!element) return;
        
        // Create canvas from the element
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        });
        
        // Create PDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 10;
        
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        pdf.save(`Order-${order.orderNumber}.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try printing instead.');
      }
    }, 100);
  };

  return (
    <div className="max-w-5xl mx-auto p-8 invoice-print-root" style={{ width: '210mm', margin: '0 auto' }}>
      <div className="mx-auto">
        <div className="relative mt-4 overflow-hidden bg-white dark:bg-slate-700 rounded-lg shadow">
          <div className="absolute top-4 right-4 print:hidden" data-print="hidden">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button size={"sm"} variant={"outline"}>
                  Download/Print
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enter Customer Name</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handlePrintWithName} className="flex-1">
                      Print Receipt
                    </Button>
                    <Button onClick={handleDownloadPDF} variant="outline" className="flex-1">
                      Download PDF
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div ref={componentRef} className="invoice-container px-4 py-6 sm:px-8 sm:py-10 bg-white print:bg-white" style={{ backgroundColor: 'white', color: 'black', width: '186mm', minHeight: '297mm', margin: '0 auto', boxShadow: '0 0 10px rgba(0,0,0,0.06)' }}>
            <div className="page-break-avoid">
              <div className="invoice-header pt-16 pb-8 text-center sm:py-8">
                <Logo />
                <h1 className="mt-4 text-2xl font-bold text-green-700 dark:text-green-50">
                  Africa PHARMACY PURCHASE ORDER
                </h1>
                <p className="company-info text-[10px] text-muted-foreground">
                  N0 4012/A/MINSANTE DU 09 JUIN 2024/ UIN: P095800234204H
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Rail - Douala
                </p>
                
                <div className="order-details mt-6 text-left space-y-1">
                  <p className="text-sm font-normal text-gray-600">
                    <span className="font-semibold">Date:</span> {currentDate}
                  </p>
                  <p className="text-sm font-normal text-gray-600">
                    <span className="font-semibold">REF: Bill</span> #{order.orderNumber}
                  </p>
                  <p className="text-sm font-normal text-gray-600">
                    <span className="font-semibold">Client:</span> {customerName}
                  </p>
                </div>
              </div>

              <div className="py-4 text-xs page-break-avoid">
                <h2 className="mb-4 text-center font-semibold text-base">
                  Purchase Order for Medications
                </h2>
                <table className="invoice-table w-full text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 p-2 bg-gray-100 text-left">Order Date</th>
                      <th className="border border-gray-300 p-2 bg-gray-100 text-left">Order No</th>
                      <th className="border border-gray-300 p-2 bg-gray-100 text-left">P. Method</th>
                      <th className="border border-gray-300 p-2 bg-gray-100 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2">{currentDate}</td>
                      <td className="border border-gray-300 p-2">#{order.orderNumber}</td>
                      <td className="border border-gray-300 p-2">
                        <span className="payment-badge">
                          {getPaymentMethodDisplay(order.paymentMethod)}
                        </span>
                      </td>
                      <td className="border border-gray-300 p-2">
                        <span className="status-badge">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="product-items py-8">
                <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">
                  Order Items
                </h2>

                <div className="mt-4">
                  {order.lineOrderItems.length > 0 &&
                    order.lineOrderItems.map((item, i) => (
                      <div key={i} className="product-item flex items-start py-3 border-b border-gray-200">
                        <div className="flex-shrink-0">
                          <Image
                            width={48}
                            height={48}
                            className="object-cover w-12 h-12 rounded"
                            src={item.productThumbnail}
                            alt={item.name}
                          />
                        </div>

                        <div className="product-details flex-grow ml-4">
                          <p className="product-name font-medium text-gray-900">
                            {item.name}
                          </p>
                          <p className="product-price-qty text-xs text-gray-500 mt-1">
                            {Number(item.price).toLocaleString('fr-CM')} FCFA × {item.qty}
                          </p>
                        </div>

                        <div className="product-total text-right">
                          <p className="text-sm font-bold text-gray-900">
                            {(Number(item.price) * Number(item.qty)).toLocaleString('fr-CM')} FCFA
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="totals-section py-4 page-break-avoid">
                <div className="space-y-2">
                  <div className="total-line flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Sub total</span>
                    <span className="text-sm font-medium text-gray-600">
                      {Number(totalSum).toLocaleString('fr-CM')} FCFA
                    </span>
                  </div>
                  
                  {/* Insurance Information */}
                  {order.paymentMethod === 'INSURANCE' && order.insuranceAmount && (
                    <>
                      <div className="total-line flex justify-between border-t pt-2">
                        <span className="text-sm font-medium text-blue-600">
                          Insurance Coverage ({order.insurancePercentage}%)
                        </span>
                        <span className="text-sm font-medium text-blue-600">
                          -{Number(order.insuranceAmount).toLocaleString('fr-CM')} FCFA
                        </span>
                      </div>
                      {order.insuranceProviderName && (
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Provider: {order.insuranceProviderName}</span>
                          {order.insurancePolicyNumber && (
                            <span>Policy: {order.insurancePolicyNumber}</span>
                          )}
                        </div>
                      )}
                      <div className="total-line flex justify-between">
                        <span className="text-sm font-medium text-green-600">Customer Paid</span>
                        <span className="text-sm font-medium text-green-600">
                          {Number(order.customerPaidAmount || order.amountPaid).toLocaleString('fr-CM')} FCFA
                        </span>
                      </div>
                    </>
                  )}
                  
                  <div className="total-line final-total flex justify-between border-t pt-2">
                    <span className="text-base font-medium text-gray-900">Total</span>
                    <span className="text-base font-bold text-gray-900">
                      {Number(totalSum).toLocaleString('fr-CM')} FCFA
                    </span>
                  </div>
                </div>
                
                <div className="amount-words mt-4 text-sm text-gray-600">
                  <p className="italic">
                    Amount in words: {numberToWords(Number(totalSum))} CFA Francs
                  </p>
                  {order.paymentMethod === 'INSURANCE' && (
                    <p className="italic text-xs mt-2 text-blue-600">
                      Insurance claim processed for {order.insuranceProviderName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}