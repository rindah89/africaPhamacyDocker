"use client";
import Logo from "@/components/global/Logo";
import { useAppSelector } from "@/redux/hooks/hooks";
import { ILineOrder } from "@/types/types";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useReactToPrint } from "react-to-print";
import { getCurrentDateAndTime } from "@/lib/getCurrentDateTime";
import { convertIsoToDateString } from "@/lib/covertDateToDateString";
import OrderStatusBtn from "./OrderStatusBtn";
import PaymentMethodBtn from "./PaymentMethodBtn";

export default function OrderInvoice({ order }: { order: ILineOrder }) {
  const totalSum = order.lineOrderItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  // const currentDate = "2024";
  // console.log(typeof order.createdAt);
  // console.log(order.createdAt);
  const currentDate = convertIsoToDateString(order.createdAt);
  const componentRef = React.useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  return (
    <div className="max-w-5xl mx-auto">
      <div className="max-w-2xl mx-auto">
        <div
          ref={componentRef}
          className="relative mt-4 overflow-hidden bg-white dark:bg-slate-700 rounded-lg shadow"
        >
          <div className="absolute top-4 right-4">
            <Button onClick={handlePrint} size={"sm"} variant={"outline"}>
              Download/Print
            </Button>
          </div>

          <div className="px-4 py-6 sm:px-8 sm:py-10">
            <div className="-my-8 divide-y divide-gray-200">
              <div className="pt-16 pb-8 text-center sm:py-8">
                {/* <CheckCircle2 className="w-10 h-10 mx-auto text-green-500" /> */}
                <Logo />

                <h1 className="mt-4 text-2xl font-bold text-green-700 dark:text-green-50">
                  Order Confirmed
                </h1>
                <p className="mt-2 text-sm font-normal text-gray-600 dark:text-slate-300">
                  <span className="font-bold">Hello {order.firstName}</span>{" "}
                  Your order #{order.orderNumber} has been confirmed. Thank you
                </p>
              </div>
              <div className="py-4 text-xs">
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Order No</TableHead>
                      <TableHead>P.Method</TableHead>
                      <TableHead>Status</TableHead>
                      {/* Removed Shipping Address column */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{currentDate}</TableCell>
                      <TableCell>#{order.orderNumber}</TableCell>
                      <TableCell>
                        <PaymentMethodBtn order={order} />
                      </TableCell>
                      <TableCell>
                        <OrderStatusBtn order={order} />
                      </TableCell>
                      {/* Removed Shipping Address cell */}
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
                      order.lineOrderItems.map((item, i) => {
                        return (
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
                        );
                      })} 
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
                  {/* Removed Shipping Cost section */}
                  <li className="flex items-center justify-between">
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      Total
                    </p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      {Number(totalSum)} FCFA
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
          <div className="py-3 text-right text-xs text-green-700">
          <Link href="/orders">View All Orders</Link>
        </div>
      </div>
    </div>
  );
}
