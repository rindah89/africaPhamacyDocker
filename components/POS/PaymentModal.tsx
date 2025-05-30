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
import { Loader2, Shield } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import toast from "react-hot-toast";
import { getInsuranceProviders } from "@/actions/insurance";

interface InsuranceProvider {
  id: string;
  name: string;
  code: string;
  status: boolean;
}

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
  
  // Insurance-related state
  const [useInsurance, setUseInsurance] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [insurancePercentage, setInsurancePercentage] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [policyNumber, setPolicyNumber] = useState<string>('');
  const [providers, setProviders] = useState<InsuranceProvider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);

  // Calculated amounts
  const insuranceAmount = useInsurance && insurancePercentage 
    ? (totalAmount * parseFloat(insurancePercentage)) / 100 
    : 0;
  const customerPaymentAmount = totalAmount - insuranceAmount;

  useEffect(() => {
    if (isOpen) {
      console.log('🔓 PaymentModal opened:', { 
        totalAmount, 
        orderNumber,
        customerName: customerData?.customerName
      });
      
      // Reset all state
      setAmountPaid('');
      setChange(0);
      setProcessing(false);
      setUseInsurance(false);
      setSelectedProviderId('');
      setInsurancePercentage('');
      setCustomerName(customerData?.customerName || '');
      setPolicyNumber('');
      
      // Load insurance providers
      loadInsuranceProviders();
    }
  }, [isOpen, totalAmount, orderNumber, customerData]);

  const loadInsuranceProviders = async () => {
    setLoadingProviders(true);
    try {
      const result = await getInsuranceProviders();
      if (result.success) {
        const activeProviders = result.data.filter((p: InsuranceProvider) => p.status);
        setProviders(activeProviders);
      } else {
        console.error('Failed to load insurance providers:', result.error);
      }
    } catch (error) {
      console.error('Error loading insurance providers:', error);
    } finally {
      setLoadingProviders(false);
    }
  };

  const handleAmountPaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    console.log('Amount paid changed:', { value, customerPaymentAmount });
    setAmountPaid(value);
    
    const numericAmount = parseInt(value) || 0;
    const changeAmount = numericAmount - customerPaymentAmount;
    console.log('Change calculated:', { numericAmount, customerPaymentAmount, changeAmount });
    setChange(changeAmount);
  };

  const handleInsurancePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    if (parseFloat(value) <= 100) {
      setInsurancePercentage(value);
    }
  };

  const validateInsuranceData = () => {
    if (!useInsurance) return true;
    
    if (!selectedProviderId) {
      toast.error("Please select an insurance provider");
      return false;
    }
    
    if (!insurancePercentage || parseFloat(insurancePercentage) <= 0) {
      toast.error("Please enter a valid insurance percentage");
      return false;
    }
    
    if (!customerName.trim()) {
      toast.error("Please enter customer name");
      return false;
    }
    
    if (!policyNumber.trim()) {
      toast.error("Please enter policy number");
      return false;
    }
    
    return true;
  };

  const handleComplete = async () => {
    console.log('💰 Payment validation started:', { 
      amountPaid, 
      customerPaymentAmount,
      useInsurance,
      insuranceAmount,
      orderNumber,
      customerName,
      itemCount: orderData?.orderItems?.length
    });

    if (!validateInsuranceData()) {
      return;
    }

    const numericAmount = parseInt(amountPaid) || 0;
    if (numericAmount < customerPaymentAmount) {
      console.log('⚠️ Payment amount insufficient:', { numericAmount, customerPaymentAmount });
      toast.error("Amount paid must be equal to or greater than required amount");
      return;
    }

    setProcessing(true);
    try {
      const paymentResult = {
        amountPaid: numericAmount,
        orderNumber: orderNumber,
        success: true,
        insurance: useInsurance ? {
          providerId: selectedProviderId,
          providerName: providers.find(p => p.id === selectedProviderId)?.name || '',
          percentage: parseFloat(insurancePercentage),
          insuranceAmount: insuranceAmount,
          customerAmount: customerPaymentAmount,
          customerName: customerName.trim(),
          policyNumber: policyNumber.trim(),
        } : null
      };

      console.log('✅ Payment amount validated, proceeding to receipt with insurance data:', paymentResult);
      onPaymentComplete(paymentResult);
      
      onClose();
      toast.success(useInsurance ? "Payment with insurance processed" : "Payment processed");
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4 max-h-[500px] overflow-y-auto">
          {/* Original Amount */}
          <div className="grid gap-2">
            <Label>Total Amount</Label>
            <div className="text-lg font-semibold">
              {totalAmount.toLocaleString('fr-CM')} FCFA
            </div>
          </div>

          {/* Insurance Section */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="use-insurance" 
                checked={useInsurance}
                onCheckedChange={(checked) => setUseInsurance(checked === true)}
              />
              <Label htmlFor="use-insurance" className="flex items-center space-x-1">
                <Shield className="h-4 w-4" />
                <span>Use Insurance</span>
              </Label>
            </div>

            {useInsurance && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="customer-name">Customer Name</Label>
                  <Input
                    id="customer-name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    disabled={processing}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="policy-number">Policy Number</Label>
                  <Input
                    id="policy-number"
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                    placeholder="Enter policy number"
                    disabled={processing}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="provider">Insurance Provider</Label>
                  <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingProviders ? "Loading..." : "Select provider"} />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name} ({provider.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="insurance-percentage">Insurance Coverage %</Label>
                  <Input
                    id="insurance-percentage"
                    type="text"
                    value={insurancePercentage}
                    onChange={handleInsurancePercentageChange}
                    placeholder="Enter percentage (e.g., 80)"
                    disabled={processing}
                    className="text-right"
                  />
                </div>

                {insurancePercentage && (
                  <div className="bg-blue-50 p-3 rounded-lg space-y-1">
                    <div className="text-sm font-medium text-blue-800">Insurance Breakdown:</div>
                    <div className="flex justify-between text-sm">
                      <span>Insurance covers:</span>
                      <span className="font-medium text-blue-600">
                        {insuranceAmount.toLocaleString('fr-CM')} FCFA ({insurancePercentage}%)
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Customer pays:</span>
                      <span className="font-medium text-green-600">
                        {customerPaymentAmount.toLocaleString('fr-CM')} FCFA
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Amount to Collect */}
          <div className="grid gap-2">
            <Label>Amount to Collect from Customer</Label>
            <div className="text-lg font-semibold text-green-600">
              {customerPaymentAmount.toLocaleString('fr-CM')} FCFA
            </div>
          </div>

          {/* Amount Paid */}
          <div className="grid gap-2">
            <Label htmlFor="amount-paid">Amount Paid by Customer</Label>
            <Input
              id="amount-paid"
              type="text"
              value={amountPaid}
              onChange={handleAmountPaidChange}
              placeholder="Enter amount paid"
              autoFocus={!useInsurance}
              disabled={processing}
            />
          </div>

          {/* Change */}
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
              disabled={parseInt(amountPaid) < customerPaymentAmount}
            >
              Complete Payment
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 