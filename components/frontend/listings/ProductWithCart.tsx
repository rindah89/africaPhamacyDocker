"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import { Product } from "@prisma/client";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import Link from "next/link";
import { cn } from "@/lib/utils";
import AddToCartButton from "./AddToCartButton";
import { addProductToHistory } from "@/redux/slices/historySlice";

export default function ProductWithCart({
  item,
  scrollable = false,
}: {
  item: Product;
  scrollable?: boolean;
}) {
  const [existing, setExisting] = useState(false);
  const orderLineItems = useAppSelector((state) => state.pos.products);
  const dispatch = useAppDispatch();
  function handleAdd() {
    const newHistoryItem = {
      id: item.id,
      name: item.name,
      slug: item.slug,
      productPrice: item.productPrice,
      productThumbnail: item.productThumbnail,
      productDetails: item.productDetails,
      stockQty: item.stockQty,
    };
    dispatch(addProductToHistory(newHistoryItem));
  }
  useEffect(() => {
    // Check if the product already exists in the cart
    const isExisting = orderLineItems.some((product) => product.id === item.id);
    setExisting(isExisting);
  }, [orderLineItems, item.id]);
  return (
    <div className="border p-2 rounded-md">
      <Link onClick={handleAdd} href={`/product/${item.slug}`}>
        <Image
          width={200}
          height={200}
          alt=""
          src={item.productThumbnail ?? "/placeholder.svg"}
          className="w-full object-contain h-40 rounded-md mr-2"
        />
      </Link>
      <Link onClick={handleAdd} href={`/product/${item.slug}`}>
        <h2
          className={cn(
            "font-semibold line-clamp-1",
            scrollable && "truncate truncate-20"
          )}
        >
          {item.name}
        </h2>
        <p className="line-clamp-2 text-xs">{item.productDetails}</p>
      </Link>
      <div className="flex items-center justify-between py-2">
        <p className="text-blue-600 text-sm font-medium">
          {item.productPrice.toLocaleString('fr-CM', { style: 'currency', currency: 'XAF' })}
        </p>
        <Button variant={"outline"} size={"sm"} className="">
          {item.stockQty} items
        </Button>
      </div>
      <AddToCartButton showQty={false} product={item} />
    </div>
  );
}
