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

export function ReceiptPrint({ setSuccess }: { setSuccess: any }) {
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
        <div className="mx-auto w-full max-w-[200px]">
          <div className="" ref={componentRef}>
            <DrawerHeader className="p-2">
              <DrawerTitle className="uppercase tracking-widest text-center text-[12px]">
                Karen Pharmacy
              </DrawerTitle>
              <div className="flex flex-col items-center justify-center border-b pb-1">
                <p className="text-[8px]">City: Bojongo - Douala</p>
                <p className="text-[8px]">Tel: +237 675 708 688</p>
              </div>
              <h1 className="uppercase tracking-widest text-center text-[10px] my-1">RECEIPT</h1>
              <div className="flex items-center justify-between text-[8px] border-b pb-1">
                <p>Date: {currentDate}</p>
                <p>Time: {currentTime}</p>
              </div>
            </DrawerHeader>
            <div className="px-1 pb-0 text-center">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/2 text-left text-[8px] py-1">Item</TableHead>
                    <TableHead className="w-1/4 text-center text-[8px] py-1">Qty</TableHead>
                    <TableHead className="w-1/4 text-right text-[8px] py-1">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderLineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium max-w-24 truncate text-left text-[8px] py-1">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-center text-[8px] py-1">{item.qty}</TableCell>
                      <TableCell className="text-right text-[8px] py-1">
                        {item.price.toLocaleString("fr-CM")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="py-1"></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-left font-bold text-[9px]">Total</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right font-bold text-[9px]">
                      {totalSum}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
            <div className="pt-2 text-center border-t mt-2">
              <p className="text-[7px] text-muted-foreground">Thank you for your purchase!</p>
              <p className="text-[7px] text-muted-foreground">Merci pour votre achat !</p>
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
