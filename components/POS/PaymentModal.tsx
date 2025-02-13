"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { processPaymentAndOrder } from "@/actions/pos";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onPaymentComplete: (result: any) => void;
  orderData: any;
  customerData: any;
  orderNumber: string;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  totalAmount,
  onPaymentComplete,
  orderData,
  customerData,
  orderNumber
}: PaymentModalProps) {
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [change, setChange] = useState<number>(0);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      console.log('PaymentModal opened', { totalAmount, orderNumber });
      setAmountPaid('');
      setChange(0);
      setProcessing(false);
    }
  }, [isOpen, totalAmount, orderNumber]);

  const handleAmountPaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    console.log('Amount paid changed:', { value });
    setAmountPaid(value);
    
    const numericAmount = parseInt(value) || 0;
    const changeAmount = numericAmount - totalAmount;
    console.log('Change calculated:', { numericAmount, totalAmount, changeAmount });
    setChange(changeAmount);
  };

  const handleComplete = async () => {
    console.log('Payment completion started', { 
      amountPaid, 
      totalAmount, 
      orderNumber,
      orderData,
      customerData 
    });

    const numericAmount = parseInt(amountPaid) || 0;
    if (numericAmount < totalAmount) {
      console.log('Payment amount insufficient', { numericAmount, totalAmount });
      return;
    }

    setProcessing(true);
    try {
      console.log('Processing payment...');
      const result = await processPaymentAndOrder(
        orderData,
        customerData,
        orderNumber,
        numericAmount
      );

      console.log('Payment process result:', result);

      if (result.success) {
        console.log('Payment successful, calling completion handlers');
        toast.success("Payment processed successfully");
        onPaymentComplete({ ...result, amountPaid: numericAmount });
        onClose();
        console.log('Payment modal closed');
      } else {
        console.error('Payment failed:', result.message);
        toast.error(result.message || "Failed to process payment");
      }
    } catch (error: any) {
      console.error("Payment processing error:", error);
      toast.error(error.message || "Failed to process payment");
    } finally {
      console.log('Payment processing completed');
      setProcessing(false);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        console.log('Dialog open state changing:', { open });
        onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Total Amount</Label>
            <div className="text-lg font-semibold">
              {totalAmount.toLocaleString('fr-CM')} FCFA
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount-paid">Amount Paid</Label>
            <Input
              id="amount-paid"
              type="text"
              value={amountPaid}
              onChange={handleAmountPaidChange}
              placeholder="Enter amount paid"
              autoFocus
              disabled={processing}
            />
          </div>
          <div className="grid gap-2">
            <Label>Change</Label>
            <div className={`text-lg font-semibold ${change < 0 ? 'text-red-500' : 'text-green-500'}`}>
              {change.toLocaleString('fr-CM')} FCFA
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={() => {
              console.log('Payment modal cancel clicked');
              onClose();
            }}
            disabled={processing}
          >
            Cancel
          </Button>
          {processing ? (
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing
            </Button>
          ) : (
            <Button 
              onClick={() => {
                console.log('Complete payment button clicked');
                handleComplete();
              }}
              disabled={parseInt(amountPaid) < totalAmount}
            >
              Complete Payment
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 