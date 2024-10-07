"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import { getCurrentDateAndTime } from "@/lib/getCurrentDateTime";
import { useReactToPrint } from "react-to-print";
import { removeAllProductsFromOrderLine } from "@/redux/slices/pointOfSale";
export function ReceiptPrint({ setSuccess }: { setSuccess: any }) {
  const orderLineItems = useAppSelector((state) => state.pos.products);
  const subTotal = orderLineItems
    .reduce((total, item) => total + item.price * item.qty, 0)
    .toFixed(2);
  const taxPercent = 10;
  const tax = (taxPercent * Number(subTotal)) / 100;
  const totalSum = (Number(subTotal) + tax).toFixed(2);

  const { currentDate, currentTime } = getCurrentDateAndTime();
  const componentRef = React.useRef(null);
  const dispatch = useAppDispatch();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  function clearOrder() {
    //Handle Remove From LocalStorage
    dispatch(removeAllProductsFromOrderLine());
    setSuccess(false);
  }
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="w-full">Print Receipt</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <div className="" ref={componentRef}>
            <DrawerHeader>
              <DrawerTitle className="uppercase tracking-widest text-center">
                Karen Pharmacy Shop
              </DrawerTitle>
              <div className="flex items-center justify-center space-x-2 border-b pb-2">
                <p className="text-xs">City: Bonapriso - Douala</p>
                <p className="text-xs">Tel: +237 699 78 30 99</p>
              </div>
              <h1 className="uppercase tracking-widest text-center">RECEIPT</h1>
              <div className="flex items-center justify-between text-xs border-b pb-1">
                <p>Date: {currentDate}</p>
                <p>Time: {currentTime}</p>
              </div>
            </DrawerHeader>
            <div className="px-4 pb-0 text-center">
              <Table>
                <TableHeader>
                  <TableRow className="">
                    <TableHead className="">Item</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderLineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium max-w-44 truncate">
                        {item.name}
                      </TableCell>
                      <TableCell>{item.qty}</TableCell>
                      <TableCell className="text-right">{item.price}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3}>Tax</TableCell>
                    <TableCell className="text-right">${tax}</TableCell>
                  </TableRow>
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-right">${totalSum}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={handlePrint}>Print</Button>
            <DrawerClose asChild>
              <Button onClick={clearOrder} variant="outline">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
