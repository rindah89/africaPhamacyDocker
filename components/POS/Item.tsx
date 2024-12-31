"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import { Product } from "@prisma/client";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import {
  addProductToOrderLine,
  removeProductFromOrderLine,
} from "@/redux/slices/pointOfSale";
import toast from "react-hot-toast";

export default function Item({ item }: { item: Product }) {
  const [existing, setExisting] = useState(false);
  const orderLineItems = useAppSelector((state) => state.pos.products);
  const dispatch = useAppDispatch();

  function handleAdd() {
    const newOrderLineItem = {
      id: item.id,
      name: item.name,
      price: item.productPrice,
      qty: 1,
      productThumbnail: item.productThumbnail,
      stock: item.stockQty,
    };
    dispatch(addProductToOrderLine(newOrderLineItem));
  }

  const handleRemove = (productId: string) => {
    dispatch(removeProductFromOrderLine(productId));
  };

  useEffect(() => {
    const isExisting = orderLineItems.some((product) => product.id === item.id);
    setExisting(isExisting);
  }, [orderLineItems, item.id]);

  return (
    <div className="border p-2 rounded-md">
      <Image
        width={200}
        height={200}
        alt={item.name || "Product image"}
        src={item.productImages[0] || "/placeholder.svg"}
        className="w-full object-cover h-28 rounded-md mr-2"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "/placeholder.svg";
        }}
      />
      <h2 className="font-semibold line-clamp-1">{item.name}</h2>
      <p className="line-clamp-2 text-xs">{item.productDetails}</p>
      <div className="flex items-center justify-between py-2">
        <div>
          <p className="text-blue-600 text-sm font-medium">
            {item.productPrice.toLocaleString('fr-CM')} FCFA
          </p>
          <p className="text-xs text-gray-500">Code: {item.productCode}</p>
        </div>
        <Button variant={"outline"} size={"sm"} className="">
          {item.stockQty} items
        </Button>
      </div>
      {existing ? (
        <Button
          variant={"destructive"}
          className="w-full"
          onClick={() => handleRemove(item.id)}
        >
          <Minus className="w-4 h-4 mr-2" />
          <span>Remove Item</span>
        </Button>
      ) : (
        <Button onClick={handleAdd} className="w-full" variant={"outline"}>
          <Plus className="mr-2 w-4 h-4" />
          <span>Add to Order line</span>
        </Button>
      )}
    </div>
  );
}


