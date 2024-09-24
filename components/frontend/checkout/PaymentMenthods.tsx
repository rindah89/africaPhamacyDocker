"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PreviousButton from "./PreviousButton";
import NextButton from "./NextButton";

import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { FormEvent, useState } from "react";
import { RadioGroup } from "@headlessui/react";
import { Check, CreditCard, Handshake, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import { setActiveStep } from "@/redux/slices/stepSlice";
import { PaymentMethod, setPaymentMethod } from "@/redux/slices/checkoutSlice";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
const plans = [
  {
    name: "Cash on Delivery",
    description: "Pay your money after receiving the Products",
    icon: Handshake,
    method: "cod",
  },
  {
    name: "Credit Card",
    description: "Securely pay with Stripe",
    icon: CreditCard,
    method: "card",
  },
];

export default function PaymentMethods() {
  const [selected, setSelected] = useState(plans[0]);

  const cartItems = useAppSelector((state) => state.cart.cartItems);
  const personalDetails = useAppSelector(
    (state) => state.checkout.personalDetails
  );
  const shippingAddress = useAppSelector(
    (state) => state.checkout.shippingAddress
  );
  const paymentMethod = useAppSelector((state) => state.checkout.paymentMethod);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const method: string = selected.method;
    const data = {
      method,
    };
    dispatch(setPaymentMethod(data));
    const checkoutData = {
      ...personalDetails,
      ...shippingAddress,
      method,
    };
    console.log(checkoutData);
    //send the cartItems to the API
    // router.push("/order/success");
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ products: cartItems }),
      });

      const data = await response.json();
      console.log(data);

      if (data?.url) {
        // console.log(response.url);
        const url = data?.url;
        setLoading(false);
        console.log(url);
        window.location.href = url;
        // router.replace(url);
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  }
  return (
    <form className="" onSubmit={handleSubmit}>
      <div className="w-full py-4 px-8">
        <h2 className="font-semibold mb-4">Payment Methods</h2>
        <div className="mx-auto w-full ">
          <RadioGroup value={selected} onChange={setSelected}>
            <RadioGroup.Label className="sr-only">Server size</RadioGroup.Label>
            <div className="flex flex-wrap gap-3 items-center space-x-3 justify-between">
              {plans.map((plan) => {
                const Icon = plan.icon;
                return (
                  <RadioGroup.Option
                    key={plan.name}
                    value={plan}
                    className={({ active, checked }) =>
                      `${
                        active
                          ? "ring-2 ring-white/60 ring-offset-2 ring-offset-sky-300"
                          : ""
                      }
                  ${checked ? "bg-slate-900 text-white" : "bg-white"}
                    relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus:outline-none`
                    }
                  >
                    {({ active, checked }) => (
                      <>
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex items-center space-x-2">
                              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100">
                                <Icon className="w-6 h-6 text-slate-700" />
                              </div>
                              <div className="text-sm">
                                <RadioGroup.Label
                                  as="p"
                                  className={`font-medium  ${
                                    checked ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  {plan.name}
                                </RadioGroup.Label>
                                <RadioGroup.Description
                                  as="span"
                                  className={`inline ${
                                    checked ? "text-sky-100" : "text-gray-500"
                                  }`}
                                >
                                  <span>{plan.description}</span>{" "}
                                </RadioGroup.Description>
                              </div>
                            </div>
                          </div>
                          {checked && (
                            <div className="shrink-0 text-white">
                              <Check className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </RadioGroup.Option>
                );
              })}
            </div>
          </RadioGroup>
        </div>
      </div>
      <div className="py-4 mt-6 flex items-center justify-between">
        <PreviousButton />
        {loading ? (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Please wait
          </Button>
        ) : (
          <NextButton />
        )}
      </div>
    </form>
  );
}
