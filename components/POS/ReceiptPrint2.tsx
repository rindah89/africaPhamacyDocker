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
import { processPaymentAndOrder } from "@/actions/pos";

interface ReceiptPrintProps {
  isOpen: boolean;
  onClose: () => void;
  orderItems: OrderLineItem[];
  customerName: string;
  customerEmail: string;
  amountPaid: number;
  orderData: any;
  customerData: any;
  orderNumber: string;
  insuranceData?: {
    providerId: string;
    providerName: string;
    percentage: number;
    insuranceAmount: number;
    customerAmount: number;
    customerName: string;
    policyNumber: string;
  } | null;
}

export default function ReceiptPrint2({ 
  isOpen,
  onClose,
  orderItems,
  customerName,
  customerEmail,
  amountPaid,
  orderData,
  customerData,
  orderNumber,
  insuranceData
}: ReceiptPrintProps) {
  console.log('🧾 ReceiptPrint2 component rendering:', {
    isOpen,
    hasItems: Boolean(orderItems?.length),
    customerName,
    amountPaid,
    orderNumber
  });

  const componentRef = React.useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = React.useState(false);
  const [hasPrinted, setHasPrinted] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const dispatch = useAppDispatch();
  
  const { currentDate, currentTime } = getCurrentDateAndTime();
  
  // Reset state when the drawer is closed
  React.useEffect(() => {
    if (!isOpen) {
      console.log('🧹 Resetting ReceiptPrint2 state as it is now closed.');
      setIsPrinting(false);
      setHasPrinted(false);
      setIsProcessing(false);
    }
  }, [isOpen]);

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
    contentRef: componentRef,
    documentTitle: `Receipt-${orderNumber}`,
    removeAfterPrint: false,
    onBeforeGetContent: async () => {
      console.log('🖨️ Starting print process...', { isPrinting, hasPrinted });
      if (!orderItems || orderItems.length === 0) {
        console.error('❌ Print failed: No items to print');
        toast.error("No items to print");
        return Promise.reject(new Error("No items to print"));
      }

      if (!hasPrinted) {
        console.error('❌ Order must be processed before printing');
        toast.error("Please process the order first");
        return Promise.reject(new Error("Order not processed"));
      }

      setIsPrinting(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      console.log('✅ Print dialog handled');
      setIsPrinting(false);
    },
    onPrintError: (errorLocation, error) => {
      console.error('❌ Print error:', errorLocation, error);
      setIsPrinting(false);
    }
  });

  const handleClose = React.useCallback(() => {
    console.log('🔒 Close requested from receipt...', { isPrinting, hasPrinted, isProcessing });

    if (isPrinting || isProcessing) {
      console.log('⚠️ Close prevented: Receipt is printing or processing');
      return;
    }
    
    onClose();
    
  }, [isPrinting, isProcessing, hasPrinted, onClose]);
  
  const handleCancelSale = () => {
    console.log('⚠️ Attempting to cancel sale without printing');
    const shouldClose = window.confirm("Are you sure you want to cancel this sale? The order will be voided.");
    if (shouldClose) {
      console.log('❌ Sale cancelled by user, closing drawer.');
      onClose();
    } else {
      console.log('↩️ Sale cancellation aborted by user');
    }
  };

  const processOrder = async () => {
    console.log('💾 Processing order...');
    setIsProcessing(true);

    try {
      console.log('🔄 Processing order...', {
        orderData,
        customerData,
        orderNumber,
        amountPaid,
        hasInsurance: !!insuranceData
      });
      
      // Add timeout to prevent indefinite hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Order processing timeout after 30 seconds')), 30000)
      );
      
      // Use API route in production for better reliability
      const useAPI = process.env.NODE_ENV === 'production' || true; // Force API usage
      
      let result;
      if (useAPI) {
        const response = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderData,
            customerData,
            orderNumber,
            amountPaid,
            insuranceData
          })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create order');
        }
        
        result = await response.json();
      } else {
        result = await Promise.race([
          processPaymentAndOrder(
            orderData,
            customerData,
            orderNumber,
            amountPaid,
            insuranceData
          ),
          timeoutPromise
        ]);
      }

      if (!result.success) {
        console.error('❌ Order processing failed:', result.message);
        toast.error(result.message || "Failed to process order");
        setIsProcessing(false);
        return false;
      }

      console.log('✅ Order processed successfully:', {
        orderId: result.order?.id,
        orderNumber: result.order?.orderNumber
      });
      
      setHasPrinted(true);
      toast.success("Order processed successfully");
      return true;
    } catch (error: any) {
      console.error('❌ Order processing error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        orderData,
        customerData
      });
      toast.error(error.message || "Failed to process order");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintAndComplete = async () => {
    if (!hasPrinted) {
      const success = await processOrder();
      if (success) {
        handlePrint();
      }
    } else {
      handlePrint();
    }
  };

  const handleCompleteWithoutPrint = async () => {
    console.log('💾 Completing sale without printing...');
    
    if (!hasPrinted) {
      const success = await processOrder();
      if (success) {
        console.log('✅ Order processed successfully without printing');
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } else {
      onClose();
    }
  };

  if (!orderItems || orderItems.length === 0) {
    console.log('⚠️ Receipt not rendered: No items');
    return null;
  }

  return (
    <Drawer 
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Receipt Preview</DrawerTitle>
          <DrawerDescription>
            Print or cancel the current sale
          </DrawerDescription>
        </DrawerHeader>
        <div className="mx-auto max-w-[300px]">
          <div ref={componentRef} className="receipt-print-content" style={{ backgroundColor: 'white', color: 'black' }}>
            {/* Receipt content remains the same */}
            <DrawerHeader className="p-2" style={{ padding: '8px' }}>
              <DrawerTitle className="uppercase tracking-widest text-center text-[16px]">
                KAREN PHARMACY 
              </DrawerTitle>
              <div className="flex flex-col items-center justify-center border-b pb-1">
                <p className="text-[12px]">Bojongo - Douala</p>
                <p className="text-[12px]">Tel: +237 678 856 364 / +237 699 438 573</p>
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
              
              {/* Insurance Information */}
              {insuranceData && (
                <div className="px-2 border-t pt-2">
                  <div className="text-center text-[10px] font-medium mb-1">INSURANCE BREAKDOWN</div>
                  <div className="flex justify-between text-[10px] mx-4 mb-1">
                    <span>Provider:</span>
                    <span>{insuranceData.providerName}</span>
                  </div>
                  <div className="flex justify-between text-[10px] mx-4 mb-1">
                    <span>Coverage:</span>
                    <span>{insuranceData.percentage}%</span>
                  </div>
                  <div className="flex justify-between text-[10px] mx-4 mb-1">
                    <span>Insurance Amount:</span>
                    <span>{insuranceData.insuranceAmount.toLocaleString("fr-CM")} F</span>
                  </div>
                  <div className="flex justify-between text-[10px] mx-4 mb-1">
                    <span>Customer Amount:</span>
                    <span className="font-medium">{insuranceData.customerAmount.toLocaleString("fr-CM")} F</span>
                  </div>
                  <div className="flex justify-between text-[10px] mx-4 mb-2">
                    <span>Policy No:</span>
                    <span>{insuranceData.policyNumber}</span>
                  </div>
                </div>
              )}
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
            {!hasPrinted ? (
              <>
                <Button 
                  onClick={handlePrintAndComplete}
                  disabled={isPrinting || isProcessing}
                >
                  {isPrinting || isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Print Receipt & Complete Sale'
                  )}
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleCompleteWithoutPrint}
                  disabled={isPrinting || isProcessing}
                >
                  Complete Sale Without Printing
                </Button>
                <DrawerClose asChild>
                  <Button 
                    variant="outline" 
                    onClick={handleCancelSale}
                    disabled={isPrinting || isProcessing}
                  >
                    Cancel Sale
                  </Button>
                </DrawerClose>
              </>
            ) : (
              <>
                <Button 
                  onClick={() => {
                    // Create a new window with just the receipt content
                    const printWindow = window.open('', 'PRINT', 'height=600,width=400');
                    if (printWindow && componentRef.current) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Receipt ${orderNumber}</title>
                            <style>
                              body { 
                                font-family: monospace; 
                                margin: 0; 
                                padding: 10px;
                                font-size: 12px;
                              }
                              .text-center { text-align: center; }
                              .font-bold { font-weight: bold; }
                              .uppercase { text-transform: uppercase; }
                              .border-b { border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px; }
                              .flex { display: flex; }
                              .justify-between { justify-content: space-between; }
                              .mb-1 { margin-bottom: 4px; }
                              .mb-2 { margin-bottom: 8px; }
                              .mt-2 { margin-top: 8px; }
                              .pt-2 { padding-top: 8px; }
                              .pb-2 { padding-bottom: 8px; }
                              .px-2 { padding-left: 8px; padding-right: 8px; }
                              .mx-4 { margin-left: 16px; margin-right: 16px; }
                              .text-[16px] { font-size: 16px; }
                              .text-[14px] { font-size: 14px; }
                              .text-[12px] { font-size: 12px; }
                              .text-[10px] { font-size: 10px; }
                              .text-[9px] { font-size: 9px; }
                            </style>
                          </head>
                          <body>
                            ${componentRef.current.innerHTML}
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.focus();
                      setTimeout(() => {
                        printWindow.print();
                        printWindow.close();
                      }, 250);
                    }
                  }}
                  variant="secondary"
                >
                  Print Receipt
                </Button>
                <DrawerClose asChild>
                  <Button onClick={handleClose}>
                    Close
                  </Button>
                </DrawerClose>
              </>
            )}
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}