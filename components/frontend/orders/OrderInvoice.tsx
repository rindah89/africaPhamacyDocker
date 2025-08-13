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
        margin: 1cm;
      }
      @media print {
        body { 
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        * { 
          color: black !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .dark * {
          color: black !important;
          background-color: white !important;
        }
        img {
          max-width: 100%;
          page-break-inside: avoid;
        }
        .print\\:hidden {
          display: none !important;
        }
        .print\\:bg-white {
          background-color: white !important;
        }
      }
    `,
    onBeforePrint: () => {
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
    <div className="max-w-5xl mx-auto p-8">
      <div className="max-w-2xl mx-auto">
        <div className="relative mt-4 overflow-hidden bg-white dark:bg-slate-700 rounded-lg shadow">
          <div className="absolute top-4 right-4 print:hidden">
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

          <div ref={componentRef} className="px-4 py-6 sm:px-8 sm:py-10 bg-white print:bg-white" style={{ backgroundColor: 'white', color: 'black' }}>
            <div className="-my-8 divide-y divide-gray-200 print:divide-gray-200">
              <div className="pt-16 pb-8 text-center sm:py-8">
                <Logo />
                <h1 className="mt-4 text-2xl font-bold text-green-700 print:text-green-700">
                  KAREN PHARMACY PURCHASE ORDER
                </h1>
                <p className="text-[10px] text-muted-foreground">
                  N0 4012/A/MINSANTE DU 09 JUIN 2024/ UIN: P095800234204H
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Bojongo - Douala
                </p>
                
                <div className="mt-6 text-left space-y-1">
                  <p className="text-sm font-normal text-gray-600 print:text-gray-600">
                    <span className="font-semibold">Date:</span> {currentDate}
                  </p>
                  <p className="text-sm font-normal text-gray-600 print:text-gray-600">
                    <span className="font-semibold">REF: Bill</span> #{order.orderNumber}
                  </p>
                  <p className="text-sm font-normal text-gray-600 print:text-gray-600">
                    <span className="font-semibold">Client:</span> {customerName}
                  </p>
                </div>

                
              </div>
              <div className="py-4 text-xs">
                <h2 className="mb-4 text-center font-semibold text-base">
                  Purchase Order for Medications
                </h2>
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Order No</TableHead>
                      <TableHead>P. Method</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{currentDate}</TableCell>
                      <TableCell>#{order.orderNumber}</TableCell>
                      <TableCell>
                        <span className={`py-1.5 px-3 rounded-full ${getPaymentMethodColor(order.paymentMethod)}`}>
                          {getPaymentMethodDisplay(order.paymentMethod)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`py-1.5 px-3 rounded-full ${
                          order.status === 'DELIVERED' ? 'bg-green-200' :
                          order.status === 'PROCESSING' ? 'bg-yellow-200' :
                          order.status === 'PENDING' ? 'bg-orange-200' : 'bg-red-200'
                        }`}>
                          {order.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div className="py-8">
                <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase print:text-gray-600">
                  Order Items
                </h2>

                <div className="flow-root mt-8">
                  <ul className="divide-y divide-gray-200 -my-5">
                    {order.lineOrderItems.length > 0 &&
                      order.lineOrderItems.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start justify-between space-x-5 py-3 md:items-stretch"
                        >
                          <div className="flex items-stretch">
                            <div className="flex-shrink-0">
                              <Image
                                width={200}
                                height={200}
                                className="object-cover w-14 h-14 rounded-lg"
                                src={item.productThumbnail}
                                alt={item.name}
                              />
                            </div>

                            <div className="flex flex-col justify-between ml-5 w-72">
                              <p className="flex-1 text-sm font-medium text-gray-900 print:text-gray-900">
                                {item.name}
                              </p>
                              <p className="text-[11px] font-medium text-gray-500">
                                ({item.price}x{item.qty}) 
                              </p>
                            </div>
                          </div>

                          <div className="ml-auto">
                            <p className="text-sm font-bold text-right text-gray-900 print:text-gray-900">
                              {(Number(item.price) * Number(item.qty))} FCFA
                            </p>
                          </div>
                        </li>
                      ))} 
                  </ul>
                </div>
              </div>

              <div className="py-4">
                <ul className="space-y-2">
                  <li className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Sub total
                    </p>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {Number(totalSum)} FCFA
                    </p>
                  </li>
                  
                  {/* Insurance Information */}
                  {order.paymentMethod === 'INSURANCE' && order.insuranceAmount && (
                    <>
                      <li className="flex items-center justify-between border-t pt-2">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          Insurance Coverage ({order.insurancePercentage}%)
                        </p>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          -{Number(order.insuranceAmount)} FCFA
                        </p>
                      </li>
                      {order.insuranceProviderName && (
                        <li className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Provider: {order.insuranceProviderName}
                          </p>
                          {order.insurancePolicyNumber && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Policy: {order.insurancePolicyNumber}
                            </p>
                          )}
                        </li>
                      )}
                      <li className="flex items-center justify-between">
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                          Customer Paid
                        </p>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                          {Number(order.customerPaidAmount || order.amountPaid)} FCFA
                        </p>
                      </li>
                    </>
                  )}
                  
                  <li className="flex items-center justify-between border-t pt-2">
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      Total
                    </p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      {Number(totalSum)} FCFA
                    </p>
                  </li>
                </ul>
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                  <p className="italic">
                    Amount in words: {numberToWords(Number(totalSum))} CFA Francs
                  </p>
                  {order.paymentMethod === 'INSURANCE' && (
                    <p className="italic text-xs mt-2 text-blue-600 dark:text-blue-400">
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