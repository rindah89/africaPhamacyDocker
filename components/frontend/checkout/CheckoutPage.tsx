"use client";
import { Button } from "@/components/ui/button";
import { BaggageClaim, ChevronRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import React from "react";
import PersonalDetailsForm from "./PersonalDetailsForm";
import OrderSummary from "./OrderSummary";
import PaymentMethods from "./PaymentMenthods";
import { useAppSelector } from "@/redux/hooks/hooks";
import { Session } from "next-auth";
import { CartMenu } from "../CartMenu";
export default function CheckoutPage({ session }: { session: Session }) {
  const steps = useAppSelector((state) => state.step.steps);
  const cartItems = useAppSelector((state) => state.cart.cartItems);
  const activeStep = useAppSelector((state) => state.step.activeStep);
  const totalSum = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  function displayActiveForm() {
    if (activeStep === 1) {
      return <PersonalDetailsForm session={session} />;
    }else if (activeStep === 2) {
      return <OrderSummary />;
    } else if (activeStep === 3) {
      return <PaymentMethods />;
    }
  }

  return (
    <div className="container">
      <div className="max-w-4xl border mx-auto p-8 rounded-md">
        {/* Header */}
        <div className="flex items-center space-x-3 flex-wrap gap-3">
          <Link href="/cart" className="flex items-center">
            <span className="mr-2">Cart</span>
            <span className=" w-8 h-8 flex items-center justify-center rounded-full bg-slate-900 text-white">
              {cartItems.length}
            </span>
          </Link>
          {steps.map((step, index) => {
            const isLastIndex = steps.length - 1 === index;
            return (
              <div key={step.step} className="flex space-x-2 items-center">
                <Button
                  variant={step.step === activeStep ? "default" : "outline"}
                >
                  {step.name}
                </Button>
                {!isLastIndex && (
                  <span>
                    <ChevronRight className="w-4 h-4 text-slate-900" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {/* Forms */}
        <div className=" shadow rounded-md p-8 mt-4 border border-gray-200/50 dark:border-gray-700">
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-700 rounded-md py-4 px-6">
            <div className="flex space-x-2 items-center">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-white flex-shrink-0">
                <ShoppingBag className="w-6 h-6 " />
              </div>
              <p>
                You have {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in cart. Sub total is {totalSum.toLocaleString('fr-CM')} FCFA
              </p>
            </div>
            <CartMenu from="checkout" />
          </div>
          <div className="pt-4">{displayActiveForm()}</div>
        </div>
      </div>
    </div>
  );
}
