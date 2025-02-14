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
  DrawerDescription,
} from "@/components/ui/drawer";
import { useAppDispatch } from "@/redux/hooks/hooks";
import { getCurrentDateAndTime } from "@/lib/getCurrentDateTime";
import { useReactToPrint } from "react-to-print";
import { removeAllProductsFromOrderLine } from "@/redux/slices/pointOfSale";
import { OrderLineItem } from "@/redux/slices/pointOfSale";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface ReceiptPrintProps {
  setSuccess: (value: boolean) => void;
  orderItems: OrderLineItem[];
  customerName: string;
  customerEmail: string;
  amountPaid?: number;
  onComplete?: () => void;
}

export default function ReceiptPrint2({ 
  setSuccess, 
  orderItems,
  customerName,
  customerEmail,
  amountPaid = 0,
  onComplete
}: ReceiptPrintProps) {
  const componentRef = React.useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = React.useState(true);
  const [isPrinting, setIsPrinting] = React.useState(false);
  const [hasPrinted, setHasPrinted] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const dispatch = useAppDispatch();
  const mountedRef = React.useRef(false);

  const { currentDate, currentTime } = getCurrentDateAndTime();
  
  // Ensure proper initialization on mount
  React.useEffect(() => {
    console.log('Receipt component mounted', {
      customerName,
      itemCount: orderItems.length,
      amountPaid,
      mountCount: mountedRef.current
    });
    
    mountedRef.current = true;
    setIsOpen(true);
    setIsClosing(false);
    setHasPrinted(false);
    setIsPrinting(false);

    return () => {
      console.log('Receipt component unmounting', {
        hasPrinted,
        isClosing,
        mountCount: mountedRef.current
      });
      mountedRef.current = false;
    };
  }, []);

  // Handle drawer state changes
  const handleDrawerStateChange = React.useCallback((open: boolean) => {
    console.log('Drawer state change requested:', { 
      currentlyOpen: isOpen, 
      requestedOpen: open,
      isClosing,
      hasPrinted,
      mountCount: mountedRef.current
    });
    
    if (!open && !isClosing) {
      console.log('Preventing unauthorized drawer close');
      return;
    }
    
    setIsOpen(open);
  }, [isOpen, isClosing, hasPrinted]);

  const subTotal1 = orderItems.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );
  const subTotal = Number(subTotal1).toLocaleString("fr-CM");
  const totalSum = subTotal;
  const change = amountPaid - subTotal1;
  const amountPaidFormatted = amountPaid.toLocaleString("fr-CM");
  const changeFormatted = change.toLocaleString("fr-CM");

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onBeforeGetContent: () => {
      console.log('Starting print process...', { isPrinting, hasPrinted });
      if (!orderItems || orderItems.length === 0) {
        console.error('Print failed: No items to print');
        toast.error("No items to print");
        return Promise.reject(new Error("No items to print"));
      }
      setIsPrinting(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      console.log('Print completed successfully');
      setIsPrinting(false);
      setHasPrinted(true);
      toast.success("Receipt printed successfully");
    }
  });

  const handleClose = React.useCallback(() => {
    console.log('Attempting to close receipt...', {
      isPrinting,
      hasPrinted,
      isClosing
    });

    if (isPrinting) {
      console.log('Close prevented: Receipt is printing');
      return;
    }

    if (hasPrinted) {
      console.log('Closing receipt after successful print');
      setIsClosing(true);
      setIsOpen(false);
      // Delay the cleanup to ensure drawer animation completes
      setTimeout(() => {
        dispatch(removeAllProductsFromOrderLine());
        setSuccess(false);
        onComplete?.();
      }, 300);
    } else {
      console.log('Attempting to cancel sale without printing');
      const shouldClose = window.confirm("Are you sure you want to cancel this sale? The order will be voided.");
      if (shouldClose) {
        console.log('Sale cancelled by user');
        setIsClosing(true);
        setIsOpen(false);
        // Delay the cleanup to ensure drawer animation completes
        setTimeout(() => {
          dispatch(removeAllProductsFromOrderLine());
          setSuccess(false);
          onComplete?.();
        }, 300);
      } else {
        console.log('Sale cancellation aborted by user');
      }
    }
  }, [isPrinting, hasPrinted, isClosing, dispatch, setSuccess, onComplete]);

  // Don't render if no items
  if (!orderItems || orderItems.length === 0) {
    console.log('Receipt not rendered: No items');
    return null;
  }

  return (
    <Drawer 
      open={isOpen}
      onOpenChange={handleDrawerStateChange}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Receipt Preview</DrawerTitle>
          <DrawerDescription>
            Print or cancel the current sale
          </DrawerDescription>
        </DrawerHeader>
        <div className="mx-auto max-w-[300px]">
          <div ref={componentRef}>
            {/* Receipt content remains the same */}
            <DrawerHeader className="p-2">
              <DrawerTitle className="uppercase tracking-widest text-center text-[16px]">
                KAREN PHARMACY 
              </DrawerTitle>
              <div className="flex flex-col items-center justify-center border-b pb-1">
                <p className="text-[12px]">Bojongo - Douala</p>
                <p className="text-[12px]">Tel: +237 675 708 688</p>
              </div>
              <h1 className="uppercase tracking-widest text-center text-[14px] my-1">RECEIPT</h1>
              <div className="flex flex-col justify-center text-[10px] border-b pb-1">
                <p>Date: {currentDate}</p>
                <p>Time: {currentTime}</p>
              </div>
            </DrawerHeader>
            <div className="px-1 pb-0 text-center">
              <div className="space-y-3 border-b pb-2 px-2">
                {orderItems.map((item) => (
                  <div key={item.id} className="text-left mb-2">
                    <div className="font-medium text-[10px] whitespace-normal break-words mb-1 mx-4">{item.name}</div>
                    <div className="flex justify-between text-[10px] mx-4">
                      <span>Qty: {item.qty}</span>
                      <span>{item.price.toLocaleString("fr-CM")} F</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 pt-2 flex justify-between items-center px-2 pb-2">
                <span className="text-left font-bold text-[12px] ml-4">Total</span>
                <div className="text-right font-bold text-[12px] flex flex-col items-end mr-4">
                  <p className="whitespace-nowrap">{totalSum} F</p>
                </div>
              </div>
            </div>
            <div className="px-2 border-t pt-2">
              <div className="flex justify-between text-[10px] mx-4 mb-1">
                <span>Amount Paid:</span>
                <span>{amountPaidFormatted} F</span>
              </div>
              <div className="flex justify-between text-[10px] mx-4 mb-2">
                <span>Change:</span>
                <span>{changeFormatted} F</span>
              </div>
            </div>
            <div className="pt-2 text-center border-t mt-2">
              <p className="text-[9px]">Thank you for your purchase!</p>
              <p className="text-[9px]">Merci pour votre achat !</p>
            </div>
          </div>
          <DrawerFooter>
            <Button 
              onClick={handlePrint}
              disabled={isPrinting}
            >
              {isPrinting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : hasPrinted ? (
                'Print Again'
              ) : (
                'Print Receipt & Complete Sale'
              )}
            </Button>
            <DrawerClose asChild>
              <Button 
                variant="outline" 
                onClick={handleClose}
                disabled={isPrinting}
              >
                {hasPrinted ? 'Close' : 'Cancel Sale'}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}