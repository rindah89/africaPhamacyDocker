"use client";
import { createLineOrder } from "@/actions/pos";
import OrderInvoice from "@/components/frontend/orders/OrderInvoice";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import { removeAllProductsFromCart } from "@/redux/slices/cartSlice";
import { ILineOrder } from "@/types/types";
import { LineOrder } from "@prisma/client";
import { AlertCircle, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function Page() {
  // const { data: session, status } = useSession();
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
  const shippingAddressInfo = useAppSelector(
    (state) => state.checkout.shippingAddress
  );
  const paymentMethod = useAppSelector((state) => state.checkout.paymentMethod);

  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [order, setOrder] = useState<ILineOrder | null>(null);
  const dispatch = useAppDispatch();

  // Use a ref to keep track if the effect has already run
  const hasEffectRun = useRef(false);

  useEffect(() => {
    async function handleCreateOrder() {
      setProcessing(true);
      const customerData = {
        customerId: userId ?? "",
        customerName:
          `${personalDetails.firstName} ${personalDetails.lastName}` ?? "",
        customerEmail: personalDetails.email ?? "",
        ...shippingAddressInfo,
        ...personalDetails,
        ...paymentMethod,
      };
      // console.log(customerData);
      const orderItems = cartItems.map((item) => {
        return {
          id: item.id,
          name: item.name,
          price: item.price,
          qty: item.qty,
          productThumbnail: item.image,
        };
      });
      const orderAmount = +totalSum;
      const newOrder = {
        orderItems,
        orderAmount,
        orderType: "Sale",
        source: "store",
      };
      try {
        const savedOrder = await createLineOrder(newOrder, customerData);
        if (savedOrder) {
          setProcessing(false);
          toast.success("Order Created Successfully");
          setOrder(savedOrder);
          setSuccess(true);
          localStorage.setItem("savedOrder", JSON.stringify(savedOrder));
          // Clear Cart Items
          dispatch(removeAllProductsFromCart());
        }
      } catch (error) {
        console.log(error);
        setProcessing(false);
      }
    }
    if (hasEffectRun.current) {
      return;
    }

    hasEffectRun.current = true;
    const savedOrder = localStorage.getItem("savedOrder");
    if (savedOrder && cartItems.length == 0) {
      setOrder(JSON.parse(savedOrder));
      setSuccess(true);
    } else if (userId && cartItems.length > 0) {
      handleCreateOrder();
    }
  }, [
    userId,
    cartItems,
    personalDetails,
    shippingAddressInfo,
    paymentMethod,
    totalSum,
    dispatch,
  ]);

  // if (status === "loading") {
  //   return (
  //     <div className="min-h-96 flex items-center justify-center">
  //       <Button disabled>
  //         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  //         Loading User ...
  //       </Button>
  //     </div>
  //   );
  // }

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
            <OrderInvoice order={order} />
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
