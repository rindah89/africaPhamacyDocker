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
      console.log('🔓 PaymentModal opened:', { 
        totalAmount, 
        orderNumber,
        customerName: customerData?.customerName
      });
      setAmountPaid('');
      setChange(0);
      setProcessing(false);
    }
  }, [isOpen, totalAmount, orderNumber, customerData]);

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
    console.log('💰 Payment validation started:', { 
      amountPaid, 
      totalAmount, 
      orderNumber,
      customerName: customerData?.customerName,
      itemCount: orderData?.orderItems?.length
    });

    const numericAmount = parseInt(amountPaid) || 0;
    if (numericAmount < totalAmount) {
      console.log('⚠️ Payment amount insufficient:', { numericAmount, totalAmount });
      toast.error("Amount paid must be equal to or greater than total amount");
      return;
    }

    setProcessing(true);
    try {
      // Only validate payment amount and complete the modal
      console.log('✅ Payment amount validated, proceeding to receipt');
      onPaymentComplete({
        amountPaid: numericAmount,
        orderNumber: orderNumber,
        success: true
      });
      
      onClose();
      toast.success("Payment validated");
    } catch (error: any) {
      console.error("❌ Payment validation error:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      toast.error(error.message || "Failed to validate payment");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (processing) {
          console.log('Preventing dialog close during processing');
          return;
        }
        
        if (!open) {
          console.log('Dialog closing requested');
          onClose();
        }
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