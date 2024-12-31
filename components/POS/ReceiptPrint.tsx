"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
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
import toast from "react-hot-toast";

export function ReceiptPrint({ setSuccess }: { setSuccess: any }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const orderLineItems = useAppSelector((state) => state.pos.products);
  const subTotal1 = orderLineItems.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );
  const subTotal = Number(subTotal1).toLocaleString("fr-CM");
  const totalSum = subTotal;

  const { currentDate, currentTime } = getCurrentDateAndTime();
  const componentRef = React.useRef(null);
  const dispatch = useAppDispatch();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onBeforeGetContent: () => {
      if (!orderLineItems || orderLineItems.length === 0) {
        toast.error("No items to print");
        return Promise.reject(new Error("No items to print"));
      }
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setIsOpen(false);
      clearOrder();
    }
  });

  function clearOrder() {
    try {
      dispatch(removeAllProductsFromOrderLine());
      setSuccess(false);
    } catch (error) {
      console.error("Error clearing order:", error);
      toast.error("Failed to clear order");
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button className="w-full" onClick={() => setIsOpen(true)}>Print Receipt</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-[200px]">
          <div ref={componentRef}>
            <DrawerHeader className="p-2">
              <DrawerTitle className="uppercase tracking-widest text-center text-[14px]">
                KAREN PHARMACY
              </DrawerTitle>
              <div className="flex flex-col items-center justify-center border-b pb-1">
                <p className="text-[10px]">Bojongo - Douala</p>
                <p className="text-[10px]">Tel: +237 675 708 688</p>
              </div>
              <h1 className="uppercase tracking-widest text-center text-[12px] my-1">RECEIPT</h1>
              <div className="flex flex-col justify-center text-[10px] border-b pb-1">
                <p>Date: {currentDate}</p>
                <p>Time: {currentTime}</p>
              </div>
            </DrawerHeader>
            <div className="px-1 pb-0 text-center">
              <div className="space-y-2 border-b pb-2">
                {orderLineItems.map((item) => (
                  <div key={item.id} className="text-left mb-1">
                    <div className="font-medium text-[10px] whitespace-normal break-words mb-1 mx-2">{item.name}</div>
                    <div className="flex justify-between text-[10px] mx-2">
                      <span>Qty: {item.qty}</span>
                      <span>{item.price.toLocaleString("fr-CM")} F</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-2 pt-2 flex justify-between items-center pb-2">
                <span className="text-left font-bold text-[10px] ml-2">Total</span>
                <div className="text-right font-bold text-[10px] flex flex-col items-end mr-2">
                  <p className="whitespace-nowrap">{totalSum} F</p>
                </div>
              </div>
            </div>
            <div className="pt-2 text-center border-t mt-2">
              <p className="text-[8px]">Thank you for your purchase!</p>
              <p className="text-[8px]">Merci pour votre achat !</p>
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={handlePrint}>Print</Button>
            <DrawerClose asChild>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}


               
           
           
             
            