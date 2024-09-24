"use client";
import SubmitButton from "@/components/global/FormInputs/SubmitButton";
import TextArea from "@/components/global/FormInputs/TextArea";
import TextInput from "@/components/global/FormInputs/TextInput";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import {
  decrementQty,
  incrementQty,
  removeAllProductsFromCart,
  removeProductFromCart,
} from "@/redux/slices/cartSlice";
import { FeedbackProps } from "@/types/types";
import { AlertCircle, Minus, Plus, Send, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { createFeedback } from "@/actions/feedback";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function OrderCancelled() {
  const { data: session, status } = useSession();
  const userId = session?.user.id;
  const cartItems = useAppSelector((state) => state.cart.cartItems);
  const dispatch = useAppDispatch();
  function handleRemove(id: string) {
    dispatch(removeProductFromCart(id));
  }
  const handleQtyIncrement = (id: string) => {
    dispatch(incrementQty(id));
  };
  const handleQtyDecrement = (id: string) => {
    dispatch(decrementQty(id));
  };
  const totalSum = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeedbackProps>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  async function submitFeedback(data: FeedbackProps) {
    setLoading(true);
    try {
      data.orderItemIds = cartItems.map((item) => item.id);
      data.userId = userId ?? "";
      // console.log(data);
      const res = await createFeedback(data);
      if (res) {
        toast.success("Your Feedback Submitted Successfully");
        setLoading(false);
        reset();
        dispatch(removeAllProductsFromCart());
        router.push("/");
      }
      // setLoading(true);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }
  return (
    <div className="container p-8">
      <div className="max-w-xl mx-auto pb-6 -pt-3">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-bold mb-3">Order Cancelled</AlertTitle>
          <AlertDescription>
            We're sorry to see you cancel your order. But we have here some
            suggestions ?
          </AlertDescription>
        </Alert>
      </div>
      <div
        className="grid
       grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 max-w-5xl mx-auto"
      >
        <div className="shadow rounded-md border border-gray-200/50 p-4">
          {/* Give us A feedback */}
          <h2 className="scroll-m-20 text-xl font-semibold tracking-tight first:mt-0 border-b pb-3">
            Edit Shopping Cart
          </h2>
          <div className="py-4">
            <div className="">
              {cartItems.map((item, i) => {
                return (
                  <div
                    key={i}
                    className="flex justify-between gap-4 py-3 border-b "
                  >
                    <Image
                      width={200}
                      height={200}
                      alt="cart image"
                      src={item.image}
                      className="w-16 h-16 rounded-lg"
                    />
                    <div className="space-y-2">
                      <h2 className="text-xs font-medium">{item.name}</h2>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-xs flex items-center text-red-500"
                      >
                        <Trash className="w-4 h-4 mr-1" />
                        <span>Remove</span>
                      </button>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-sx">${item.price}</h2>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleQtyDecrement(item.id)}
                          className="border shadow rounded flex items-center justify-center w-10 h-7"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <p>{item.qty}</p>
                        <button
                          onClick={() => handleQtyIncrement(item.id)}
                          className="border shadow rounded flex items-center justify-center w-10 h-7 bg-slate-800 text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="space-y-1 py-3 border-b mb-3">
                <div className="flex items-center justify-between text-sm">
                  <h2 className="font-medium">Total</h2>
                  <p>${totalSum.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Button variant={"outline"} type="submit">
                Clear and Continue Shopping
              </Button>
              <Button>
                <span>Proceed to Payment</span>
              </Button>
            </div>
          </div>
        </div>
        <div className="shadow rounded-md border border-gray-200/50 p-4">
          {/* Give us A feedback */}
          <h2 className="scroll-m-20 text-xl font-semibold tracking-tight first:mt-0 border-b pb-3">
            Give Us Feedback
          </h2>
          <p className="text-sm text-muted-foreground py-3">
            We're sorry to see you cancel your order.You have cancelled your
            order. Can you give us feedback on what went wrong or if you need
            help?
          </p>
          <div className="py-4">
            <form className="" onSubmit={handleSubmit(submitFeedback)}>
              <div className="grid gap-3">
                <TextInput
                  register={register}
                  errors={errors}
                  label="Feedback Title"
                  name="title"
                />
                <TextArea
                  register={register}
                  errors={errors}
                  label="Message"
                  name="message"
                />
                <SubmitButton
                  title="Submit Feedback"
                  loadingTitle="Submitting Please wait"
                  loading={loading}
                  buttonIcon={Send}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
