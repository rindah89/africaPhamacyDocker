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
import { Loader2, Shield, Percent, DollarSign } from "lucide-react";
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

  // Discount-related state
  const [useDiscount, setUseDiscount] = useState(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'cash'>('percentage');
  const [discountPercentage, setDiscountPercentage] = useState<string>('');
  const [discountCashAmount, setDiscountCashAmount] = useState<string>('');
  const [discountReason, setDiscountReason] = useState<string>('');

  // Calculated amounts
  const discountAmount = useDiscount 
    ? discountType === 'percentage' && discountPercentage
      ? (totalAmount * parseFloat(discountPercentage)) / 100
      : discountType === 'cash' && discountCashAmount
      ? parseFloat(discountCashAmount)
      : 0
    : 0;
  
  const discountedAmount = totalAmount - discountAmount;
  
  const insuranceAmount = useInsurance && insurancePercentage 
    ? (discountedAmount * parseFloat(insurancePercentage)) / 100 
    : 0;
  
  const customerPaymentAmount = discountedAmount - insuranceAmount;

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
      setUseDiscount(false);
      setDiscountType('percentage');
      setDiscountPercentage('');
      setDiscountCashAmount('');
      setDiscountReason('');
      
      // Load insurance providers
      loadInsuranceProviders();
    }
  }, [isOpen, totalAmount, orderNumber, customerData]);

  const loadInsuranceProviders = async () => {
    setLoadingProviders(true);
    try {
      const result = await getInsuranceProviders();
      if (result.success && result.data) {
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

  const handleDiscountPercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    if (parseFloat(value) <= 100) {
      setDiscountPercentage(value);
    }
  };

  const handleDiscountCashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const numericValue = parseInt(value) || 0;
    if (numericValue <= totalAmount) {
      setDiscountCashAmount(value);
    }
  };

  const setPresetDiscount = (percentage: number) => {
    setDiscountType('percentage');
    setDiscountPercentage(percentage.toString());
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
        } : null,
        discount: useDiscount ? {
          type: discountType,
          percentage: discountType === 'percentage' ? parseFloat(discountPercentage) : null,
          cashAmount: discountType === 'cash' ? parseFloat(discountCashAmount) : null,
          discountAmount: discountAmount,
          reason: discountReason.trim() || 'No reason provided',
        } : null
      };

      console.log('✅ Payment amount validated, proceeding to receipt with insurance data:', paymentResult);
      onPaymentComplete(paymentResult);
      
      onClose();
      
      let successMessage = "Payment processed";
      if (useInsurance && useDiscount) {
        successMessage = "Payment with insurance and discount processed";
      } else if (useInsurance) {
        successMessage = "Payment with insurance processed";
      } else if (useDiscount) {
        successMessage = "Payment with discount processed";
      }
      
      toast.success(successMessage);
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

          {/* Discount Section */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="use-discount" 
                checked={useDiscount}
                onCheckedChange={(checked) => setUseDiscount(checked === true)}
              />
              <Label htmlFor="use-discount" className="flex items-center space-x-1">
                <Percent className="h-4 w-4" />
                <span>Apply Discount</span>
              </Label>
            </div>

            {useDiscount && (
              <>
                <div className="grid gap-2">
                  <Label>Discount Type</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={discountType === 'percentage' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setDiscountType('percentage');
                        setDiscountCashAmount('');
                      }}
                      disabled={processing}
                    >
                      <Percent className="h-3 w-3 mr-1" />
                      Percentage
                    </Button>
                    <Button
                      type="button"
                      variant={discountType === 'cash' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setDiscountType('cash');
                        setDiscountPercentage('');
                      }}
                      disabled={processing}
                    >
                      <DollarSign className="h-3 w-3 mr-1" />
                      Cash Amount
                    </Button>
                  </div>
                </div>

                {discountType === 'percentage' && (
                  <>
                    <div className="grid gap-2">
                      <Label>Quick Discounts</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPresetDiscount(2)}
                          disabled={processing}
                        >
                          2%
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPresetDiscount(5)}
                          disabled={processing}
                        >
                          5%
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPresetDiscount(10)}
                          disabled={processing}
                        >
                          10%
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="discount-percentage">Custom Percentage</Label>
                      <Input
                        id="discount-percentage"
                        type="text"
                        value={discountPercentage}
                        onChange={handleDiscountPercentageChange}
                        placeholder="Enter percentage (e.g., 15)"
                        disabled={processing}
                        className="text-right"
                      />
                    </div>
                  </>
                )}

                {discountType === 'cash' && (
                  <div className="grid gap-2">
                    <Label htmlFor="discount-cash">Discount Amount (FCFA)</Label>
                    <Input
                      id="discount-cash"
                      type="text"
                      value={discountCashAmount}
                      onChange={handleDiscountCashChange}
                      placeholder="Enter discount amount"
                      disabled={processing}
                      className="text-right"
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="discount-reason">Discount Reason (Optional)</Label>
                  <Input
                    id="discount-reason"
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    placeholder="Enter reason for discount"
                    disabled={processing}
                  />
                </div>

                {discountAmount > 0 && (
                  <div className="bg-orange-50 p-3 rounded-lg space-y-1">
                    <div className="text-sm font-medium text-orange-800">Discount Applied:</div>
                    <div className="flex justify-between text-sm">
                      <span>Original amount:</span>
                      <span>{totalAmount.toLocaleString('fr-CM')} FCFA</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Discount:</span>
                      <span className="font-medium text-orange-600">
                        -{discountAmount.toLocaleString('fr-CM')} FCFA
                        {discountType === 'percentage' && ` (${discountPercentage}%)`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-medium border-t pt-1">
                      <span>After discount:</span>
                      <span className="text-green-600">
                        {discountedAmount.toLocaleString('fr-CM')} FCFA
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
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