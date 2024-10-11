"use client";
import { LineOrder } from "@prisma/client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FormSelectInput from "@/components/global/FormInputs/FormSelectInput";
import SubmitButton from "@/components/global/FormInputs/SubmitButton";
import { CreditCard } from "lucide-react";
import { changeOrderPaymentMethodById, PaymentMethodData } from "@/actions/orders";
import toast from "react-hot-toast";

// Define the PaymentMethod enum here since it's not exported from @prisma/client
enum PaymentMethod {
  NONE = "NONE",
  CASH = "CASH",
  MOBILE_MONEY = "MOBILE_MONEY",
  ORANGE_MONEY = "ORANGE_MONEY",
  INSURANCE = "INSURANCE"
}

export default function PaymentMethodBtn({ order }: { order: LineOrder }) {
  const paymentMethods = [
    { label: "None", value: "NONE" },
    { label: "Cash", value: "CASH" },
    { label: "Mobile Money", value: "MOBILE_MONEY" },
    { label: "Orange Money", value: "ORANGE_MONEY" },
    { label: "Insurance", value: "INSURANCE" },
  ];

  const initialPaymentMethod = {
    label: order.paymentMethod,
    value: order.paymentMethod,
  };

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(initialPaymentMethod);
  const [loading, setLoading] = useState(false);

  async function handleChangePaymentMethod(e: React.FormEvent<HTMLFormElement>) {
    setLoading(true);
    e.preventDefault();
    const data: PaymentMethodData = {
      paymentMethod: selectedPaymentMethod.value as PaymentMethod,
    };
    try {
      const res = await changeOrderPaymentMethodById(order.id, data);
      if (res?.status === 200) {
        setSelectedPaymentMethod({
          label: res.data?.paymentMethod,
          value: res.data?.paymentMethod,
        });
        setLoading(false);
        toast.success("Payment Method Updated Successfully");
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error("Something went wrong, Try again");
    }
  }

  const getBackgroundColor = (method: string) => {
    switch (method) {
      case 'MOBILE_MONEY':
        return 'bg-yellow-200';
      case 'INSURANCE':
        return 'bg-blue-200';
      case 'ORANGE_MONEY':
        return 'bg-orange-200';
      case 'NONE':
        return 'bg-slate-200';
      default:
        return 'bg-green-200'; // Default color for other methods (e.g., CASH)
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="">
          <button className={`dark:text-slate-800 py-1.5 px-3 rounded-full ${getBackgroundColor(selectedPaymentMethod.value)}`}>
            {selectedPaymentMethod.label}
          </button>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">
              Change Payment Method
            </h2>
          </DialogTitle>
          <DialogDescription>
            <form className="space-y-4" onSubmit={handleChangePaymentMethod}>
              <FormSelectInput
                label="Payment Method"
                options={paymentMethods}
                option={selectedPaymentMethod}
                setOption={setSelectedPaymentMethod}
              />
              <DialogFooter>
                <SubmitButton
                  title="Update Payment Method"
                  loadingTitle="Updating please wait"
                  loading={loading}
                  buttonIcon={CreditCard}
                />
              </DialogFooter>
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}