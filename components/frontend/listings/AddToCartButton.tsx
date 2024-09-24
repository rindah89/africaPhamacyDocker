"use client";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import {
  addProductToCart,
  removeProductFromCart,
} from "@/redux/slices/cartSlice";
import { decrementQty, incrementQty } from "@/redux/slices/pointOfSale";
import { Product } from "@prisma/client";
import { BaggageClaim, Minus, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function AddToCartButton({
  product,
  showQty = true,
}: {
  product: Product;
  showQty?: boolean;
}) {
  const [existing, setExisting] = useState(false);
  const cartItems = useAppSelector((state) => state.cart.cartItems);
  const cartItem = cartItems.find((item) => item.id === product.id);
  const dispatch = useAppDispatch();

  const [quantity, setQuantity] = useState(1);
  function handleAdd() {
    const newCartItem = {
      id: product.id,
      name: product.name,
      price: product.productPrice,
      qty: quantity === 0 ? 1 : quantity,
      image: product.productThumbnail,
      stock: product.stockQty,
    };
    dispatch(addProductToCart(newCartItem));
  }
  function handleRemove() {
    dispatch(removeProductFromCart(product.id));
  }
  const handleQtyIncrement = () => {
    const stock = product.stockQty;
    if (quantity < stock) {
      setQuantity((pre) => pre + 1);
    }
  };
  const handleQtyDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };
  useEffect(() => {
    // Check if the product already exists in the cart
    const isExisting = cartItems.some((item) => item.id === product.id);
    setExisting(isExisting);
  }, [cartItems, product.id]);
  return (
    <div className="flex items-center space-x-6">
      {!existing && (
        <>
          {showQty && (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleQtyDecrement}
                className="border shadow rounded flex items-center justify-center w-10 h-7"
              >
                <Minus className="w-4 h-4" />
              </button>

              {/* <p>{quantity}</p> */}
              <input
                type="number"
                value={quantity === 0 ? 1 : quantity}
                className="inline-block border-0 outline-0 w-16 text-slate-900 rounded"
                onChange={(e) => setQuantity(+e.target.value)}
              />
              <button
                onClick={handleQtyIncrement}
                className="border shadow rounded flex items-center justify-center w-10 h-7 bg-slate-800 text-white"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
      {/* Add to Cart Button */}
      {existing ? (
        <Button
          variant={"destructive"}
          className="w-full"
          onClick={() => handleRemove()}
        >
          <Minus className="w-4 h-4 mr-2" />
          <span> Remove From Cart</span>
        </Button>
      ) : (
        <Button className="w-full" onClick={handleAdd}>
          <BaggageClaim className="mr-2 w-4 h-4" />
          <span>Add to Cart</span>
        </Button>
      )}
    </div>
  );
}
