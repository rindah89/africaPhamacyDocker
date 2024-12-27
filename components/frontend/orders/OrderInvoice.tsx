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

export default function OrderInvoice({ order, readOnly = true }: { order: ILineOrder; readOnly?: boolean }) {
  const [customerName, setCustomerName] = useState(order.firstName || "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const totalSum = order.lineOrderItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const currentDate = convertIsoToDateString(order.createdAt);
  const componentRef = React.useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case 'MOBILE_MONEY':
        return 'Mobile Money';
      case 'CASH':
        return 'Cash';
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
      default:
        return 'bg-gray-200';
    }
  };

  const handlePrintWithName = () => {
    setIsModalOpen(false);
    handlePrint();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="max-w-2xl mx-auto">
        <div
          ref={componentRef}
          className="relative mt-4 overflow-hidden bg-white dark:bg-slate-700 rounded-lg shadow"
        >
          <div className="absolute top-4 right-4">
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
                  <Button onClick={handlePrintWithName}>
                    Print Receipt
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="px-4 py-6 sm:px-8 sm:py-10">
            <div className="-my-8 divide-y divide-gray-200">
              <div className="pt-16 pb-8 text-center sm:py-8">
                <Logo />
                <h1 className="mt-4 text-2xl font-bold text-green-700 dark:text-green-50">
                  Karen Pharmacy Invoice
                </h1>
                <p className="text-[10px] text-muted-foreground">
                  N0 4012/A/MINSANTE DU 09 JUIN 2024/ UIN: P095800234204H
                </p>
                <p className="text-[10px] text-muted-foreground">
                  City: Bojongo - Douala
                </p>
                
                <div className="mt-6 text-left space-y-1">
                  <p className="text-sm font-normal text-gray-600 dark:text-slate-300">
                    <span className="font-semibold">Date:</span> {currentDate}
                  </p>
                  <p className="text-sm font-normal text-gray-600 dark:text-slate-300">
                    <span className="font-semibold">REF: Bill</span> #{order.orderNumber}
                  </p>
                  <p className="text-sm font-normal text-gray-600 dark:text-slate-300">
                    <span className="font-semibold">Client:</span> {customerName}
                  </p>
                </div>

                
              </div>
              <div className="py-4 text-xs">
                <h2 className="mb-4 text-center font-semibold text-base">
                  Purchase Invoice for Medications
                </h2>
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Order No</TableHead>
                      <TableHead>P.Method</TableHead>
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
                <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
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
                              <p className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-300 ">
                                {item.name}
                              </p>
                              <p className="text-[11px] font-medium text-gray-500">
                                ({item.price}x{item.qty}) 
                              </p>
                            </div>
                          </div>

                          <div className="ml-auto">
                            <p className="text-sm font-bold text-right text-gray-900 dark:text-gray-300">
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
                  <li className="flex items-center justify-between">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      
      </div>
    </div>
  );
}