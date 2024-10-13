"use client";
import { createLineOrder } from "@/actions/pos";
import OrderInvoice from "@/components/frontend/orders/OrderInvoice";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import { removeAllProductsFromCart } from "@/redux/slices/cartSlice";
import { ILineOrder } from "@/types/types";
import { PaymentMethod } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

type CheckoutPaymentMethod = {
  type: 'mobileMoney' | 'cash' | null;
  // Add other properties if necessary
};

export default function Page() {
  const params = useSearchParams();
  const userId = params.get("id") || "";
  const cartItems = useAppSelector((state) => state.cart.cartItems);
  const totalSum = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const personalDetails = useAppSelector(
    (state) => state.checkout.personalDetails
  );
 
  const paymentMethod = useAppSelector((state) => state.checkout.paymentMethod) as CheckoutPaymentMethod | null;

  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [order, setOrder] = useState<ILineOrder | null>(null);
  const dispatch = useAppDispatch();

  const hasEffectRun = useRef(false);

  useEffect(() => {
    async function handleCreateOrder() {
      setProcessing(true);
      const customerData = {
        customerId: userId ?? "",
        customerName:
          `${personalDetails.firstName} ${personalDetails.lastName}` ?? "",
        customerEmail: personalDetails.email ?? "",
        ...personalDetails,
        ...paymentMethod,
      };
      const orderItems = cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        productThumbnail: item.image,
      }));
      const orderAmount = +totalSum;
      const newOrder = {
        orderItems,
        orderAmount,
        orderType: "Sale",
        source: "store",
        paymentMethod: mapToPaymentMethod(paymentMethod?.type),
        paymentStatus: 'Paid',
      };
      try {
        const savedOrder = await createLineOrder(newOrder, customerData);
        if (savedOrder) {
          setProcessing(false);
          toast.success("Order Created Successfully");
          setOrder(savedOrder);
          setSuccess(true);
          localStorage.setItem("savedOrder", JSON.stringify(savedOrder));
          dispatch(removeAllProductsFromCart());
        }
      } catch (error) {
        console.error(error);
        setProcessing(false);
        toast.error("Error creating order");
      }
    }

    if (hasEffectRun.current) {
      return;
    }

    hasEffectRun.current = true;
    const savedOrder = localStorage.getItem("savedOrder");
    if (savedOrder && cartItems.length === 0) {
      setOrder(JSON.parse(savedOrder));
      setSuccess(true);
    } else if (userId && cartItems.length > 0) {
      handleCreateOrder();
    }
  }, [userId, cartItems, personalDetails, paymentMethod, totalSum, dispatch]);

  // Helper function to map the checkout payment method to the Prisma PaymentMethod enum
  const mapToPaymentMethod = (type: string | null | undefined): PaymentMethod => {
    switch (type) {
      case 'mobileMoney':
        return PaymentMethod.MOBILE_MONEY;
      case 'cash':
        return PaymentMethod.CASH;
      default:
        return PaymentMethod.NONE;
    }
  };

  return (
    <div className="container p-8">
      {processing ? (
        <div className="min-h-96 flex items-center justify-center">
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Invoice Please wait
          </Button>
        </div>
      ) : (
        <>
          {order && order.id ? (
            <OrderInvoice 
              order={order} 
              readOnly={true}
            />
          ) : (
            <div className="min-h-96 flex items-center justify-center">
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading Please wait
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}