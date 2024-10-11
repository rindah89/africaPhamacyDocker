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
        <div className="mx-auto w-full max-w-md">
          <div className="" ref={componentRef}>
            <DrawerHeader>
              <DrawerTitle className="uppercase tracking-widest text-center">
                Karen Pharmacy
              </DrawerTitle>
              <div className="flex items-center justify-center space-x-2 border-b pb-2">
                <p className="text-xs">City: Bojongo - Douala</p>
                <p className="text-xs">Tel: +237 675 708 688</p>
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
                  <TableRow>
                    <TableHead className="w-1/2 text-left">Item</TableHead>
                    <TableHead className="w-1/4 text-center">Qty</TableHead>
                    <TableHead className="w-1/4 text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderLineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium max-w-44 truncate text-left">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-center">{item.qty}</TableCell>
                      <TableCell className="text-right">
                        {item.price.toLocaleString("fr-CM")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  {/* Empty row for space before total */}
                  <TableRow>
                    <TableCell colSpan={3} className="py-2"></TableCell>
                  </TableRow>
                  {/* Total row */}
                  <TableRow>
                    <TableCell className="text-left font-bold">Total</TableCell>
                    <TableCell></TableCell> {/* Empty cell to maintain alignment */}
                    <TableCell className="text-right font-bold">
                      {totalSum}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
            {/* Thank you message */}
            <div className="pt-4 text-center border-t mt-4">
              <p className="text-xs text-muted-foreground">Thank you for your purchase!</p>
              <p className="text-xs text-muted-foreground">Merci pour votre achat !</p>
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
