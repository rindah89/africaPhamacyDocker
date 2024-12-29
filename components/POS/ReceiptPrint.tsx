"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
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
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import { getCurrentDateAndTime } from "@/lib/getCurrentDateTime";
import { useReactToPrint } from "react-to-print";
import { removeAllProductsFromOrderLine } from "@/redux/slices/pointOfSale";

export function ReceiptPrint({ setSuccess, orderNumber }: { setSuccess: any; orderNumber?: string }) {
  const orderLineItems = useAppSelector((state) => state.pos.products);
  const subTotal1 = orderLineItems.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );
  const subTotal = Number(subTotal1).toLocaleString("fr-CM");
  const totalSum = subTotal; // Using subTotal directly as total

  const { currentDate, currentTime } = getCurrentDateAndTime();
  const componentRef = React.useRef(null);
  const dispatch = useAppDispatch();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  function clearOrder() {
    // Clear the order and reset success state
    dispatch(removeAllProductsFromOrderLine());
    setSuccess(false);
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="w-full">Print Receipt</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-9 max-w-[300px]">
          <div className="" ref={componentRef}>
            <DrawerHeader className="p-2">
              <DrawerTitle className="uppercase tracking-widest text-center text-[16px]">
                KAREN PHARMACY 
              </DrawerTitle>
              <div className="flex flex-col items-center justify-center border-b pb-1">
                <p className="text-[12px]"> Bojongo - Douala</p>
                <p className="text-[12px]">Tel: +237 675 708 688</p>
              </div>
              <h1 className="uppercase tracking-widest text-center text-[14px] my-1">RECEIPT</h1>
              <div className="flex flex-col justify-center text-[12px] border-b pb-1">
                <p>Date: {currentDate}</p>
                <p>Time: {currentTime}</p>
              </div>
              {orderNumber && (
                <div className="text-[10px] py-1 border-b">
                  <p>Order No: #{orderNumber}</p>
                </div>
              )}
            </DrawerHeader>
            <div className="px-1 pb-0 text-center">
              <div className="space-y-3 border-b pb-2 px-2">
                {orderLineItems.map((item) => (
                  <div key={item.id} className="text-left">
                    <div className="font-medium text-[10px]">{item.name}</div>
                    <div className="flex justify-between text-[10px]">
                      <span>Qty: {item.qty}</span>
                      <span>{item.price.toLocaleString("fr-CM")} FCFA</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 pt-2 flex justify-between items-center px-2">
                <span className="text-left font-bold text-[10px]">Total</span>
                <div className="text-right font-bold text-[10px] flex flex-col items-end">
                  <p>{totalSum}</p>
                  <p>FCFA</p>
                </div>
              </div>
            </div>
            <div className="pt-2 text-center border-t mt-2">
              <p className="text-[9px] ">Thank you for your purchase!</p>
              <p className="text-[9px] ">Merci pour votre achat !</p>
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
