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
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useAppDispatch } from "@/redux/hooks/hooks";
import { getCurrentDateAndTime } from "@/lib/getCurrentDateTime";
import { useReactToPrint } from "react-to-print";
import { removeAllProductsFromOrderLine } from "@/redux/slices/pointOfSale";
import { OrderLineItem } from "@/redux/slices/pointOfSale";
import toast from "react-hot-toast";
import { createSalesRecords } from "@/actions/pos";
import { Loader2 } from "lucide-react";

interface ReceiptPrintProps {
  setSuccess: (value: boolean) => void;
  orderNumber?: string;
  orderItems: OrderLineItem[];
  orderId: string;
  customerName: string;
  customerEmail: string;
  amountPaid?: number;
}

export default function ReceiptPrint2({ 
  setSuccess, 
  orderNumber, 
  orderItems,
  orderId,
  customerName,
  customerEmail,
  amountPaid = 0
}: ReceiptPrintProps) {
  console.log('ReceiptPrint2 render', { 
    orderNumber, 
    orderId, 
    itemCount: orderItems.length,
    customerName 
  });

  // Use refs to track component state
  const componentRef = React.useRef<HTMLDivElement>(null);
  const mounted = React.useRef(true);
  const [isOpen, setIsOpen] = React.useState(true);
  const [isPrinting, setIsPrinting] = React.useState(false);
  const [hasPrinted, setHasPrinted] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const dispatch = useAppDispatch();

  // Handle mount/unmount
  React.useEffect(() => {
    console.log('Mount effect running', { orderId, isOpen });
    mounted.current = true;
    setIsOpen(true);

    return () => {
      console.log('Unmounting component', { orderId, isOpen, hasPrinted });
      mounted.current = false;
    };
  }, [orderId]);  // Add orderId as dependency to ensure proper mounting

  // Handle drawer state changes
  const handleOpenChange = (open: boolean) => {
    console.log('handleOpenChange called', { 
      newOpen: open, 
      currentOpen: isOpen,
      hasPrinted, 
      isClosing,
      orderId,
      mounted: mounted.current 
    });
    
    if (!mounted.current) {
      console.log('Component not mounted, ignoring state change');
      return;
    }

    // Always keep open unless explicitly closing
    if (!open && !isClosing) {
      console.log('Preventing automatic close');
      setIsOpen(true);
      return;
    }

    // If trying to close without printing
    if (!open && !hasPrinted && isClosing) {
      console.log('Attempting to close without printing');
      const shouldClose = window.confirm("Are you sure you want to cancel this sale? The order will be voided.");
      
      if (shouldClose) {
        console.log('User confirmed cancellation');
        setIsOpen(false);
        clearOrder();
        toast.success("Sale cancelled successfully");
      } else {
        console.log('User cancelled - keeping drawer open');
        setIsClosing(false);
        setIsOpen(true);
      }
      return;
    }

    // If closing after printing
    if (!open && hasPrinted && isClosing) {
      console.log('Closing after successful print');
      setIsOpen(false);
      return;
    }

    // For all other state changes
    console.log('Setting open state', { open });
    setIsOpen(open);
  };

  const { currentDate, currentTime } = getCurrentDateAndTime();
  
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
    onBeforeGetContent: async () => {
      console.log('Starting print process');
      
      if (!orderItems || orderItems.length === 0) {
        console.error('No items to print');
        toast.error("No items to print");
        return Promise.reject(new Error("No items to print"));
      }

      setIsPrinting(true);
      try {
        console.log('Creating sales records', {
          orderId,
          itemCount: orderItems.length,
          customerName
        });
        
        // Create sales records before printing
        const result = await createSalesRecords(
          orderId,
          orderItems,
          customerName,
          customerEmail
        );

        console.log('Sales records creation result:', result);

        if (!result.success) {
          console.error('Failed to create sales records:', result.message);
          toast.error(result.message || "Failed to create sales records");
          return Promise.reject(new Error("Failed to create sales records"));
        }

        return Promise.resolve();
      } catch (error) {
        console.error("Error creating sales:", error);
        toast.error("Failed to create sales records");
        return Promise.reject(error);
      } finally {
        setIsPrinting(false);
      }
    },
    onAfterPrint: () => {
      if (mounted.current) {
        console.log('Print completed successfully');
        setHasPrinted(true);
        toast.success("Receipt printed and sale completed successfully");
      }
    }
  });

  const clearOrder = React.useCallback(() => {
    if (!mounted.current) return;

    try {
      console.log('clearOrder called', {
        orderId,
        isOpen,
        hasPrinted,
        isClosing
      });
      dispatch(removeAllProductsFromOrderLine());
      setSuccess(false);
      console.log('Order cleared successfully');
    } catch (error) {
      console.error("Error clearing order:", error);
      toast.error("Failed to clear order");
    }
  }, [dispatch, setSuccess, orderId, isOpen, hasPrinted, isClosing]);

  const handleClose = () => {
    console.log('handleClose called', { 
      hasPrinted,
      isOpen,
      isClosing,
      orderId
    });
    
    if (hasPrinted) {
      setIsClosing(true);
      handleOpenChange(false);
      clearOrder();
    } else {
      setIsClosing(true);
      handleOpenChange(false);
    }
  };

  return (
    <Drawer 
      open={isOpen} 
      onOpenChange={handleOpenChange}
      modal={true}
      shouldScaleBackground={true}
    >
      <DrawerContent className="focus-visible:outline-none">
        <DrawerHeader>
          <DrawerTitle>Receipt Preview</DrawerTitle>
          <DrawerDescription>
            Print or cancel the current sale
          </DrawerDescription>
        </DrawerHeader>
        <div className="mx-auto max-w-[300px]">
          <div ref={componentRef}>
            <DrawerHeader className="p-2">
              <DrawerTitle className="uppercase tracking-widest text-center text-[16px]" id="receipt-title">
                KAREN PHARMACY 
              </DrawerTitle>
              <div className="flex flex-col items-center justify-center border-b pb-1">
                <p className="text-[12px]"> Bojongo - Douala</p>
                <p className="text-[12px]">Tel: +237 675 708 688</p>
              </div>
              <h1 className="uppercase tracking-widest text-center text-[14px] my-1">RECEIPT</h1>
              <div className="flex flex-col justify-center text-[10px] border-b pb-1">
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
              aria-label={isPrinting ? "Processing..." : hasPrinted ? "Print Receipt Again" : "Print Receipt & Complete Sale"}
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
                aria-label={hasPrinted ? "Close Receipt" : "Cancel Sale"}
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
