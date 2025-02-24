import { useAppDispatch } from "@/redux/hooks/hooks";
import {
  OrderLineItem,
  decrementQty,
  incrementQty,
} from "@/redux/slices/pointOfSale";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import React from "react";

export default function OrderItem({ item }: { item: OrderLineItem }) {
  const dispatch = useAppDispatch();
  function handleQtyIncrement(id: string) {
    dispatch(incrementQty(id));
  }
  function handleQtyDecrement(id: string) {
    dispatch(decrementQty(id));
  }
  return (
    <div className="border p-2 rounded-md flex ">
      <Image
        width={200}
        height={200}
        alt=""
        src={item.productThumbnail ?? "/placeholder.svg"}
        className="w-14 object-cover h-14 rounded-md mr-2"
      />
      <div className=" w-full">
        <h2 className="font-semibold line-clamp-1">{item.name}</h2>
        <div className="flex items-center justify-between py-2">
          <p className="text-blue-600 text-sm font-medium">{item.price.toLocaleString('fr-CM')} FCFA</p>
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
    </div>
  );
}
