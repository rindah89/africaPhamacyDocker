"use client";
import { useAppDispatch } from "@/redux/hooks/hooks";
import { addProductToHistory } from "@/redux/slices/historySlice";
import { type Product } from "@prisma/client";
import { BaggageClaim } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function CarouselProduct({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  function handleAdd() {
    const newHistoryItem = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      productPrice: product.productPrice,
      productThumbnail: product.productThumbnail,
      productDetails: product.productDetails,
      stockQty: product.stockQty,
    };
    dispatch(addProductToHistory(newHistoryItem));
  }
  return (
    <div className="rounded-lg mr-3  bg-white dark:bg-slate-900 overflow-hidden border shadow">
      <Link onClick={handleAdd} href={`/product/${product.slug}`}>
        <Image
          src={product.productThumbnail}
          alt={product.name}
          width={556}
          height={556}
          className="w-full h-48 object-contain"
        />
      </Link>
      <div className="px-4">
        <Link onClick={handleAdd} href={`/product/${product.slug}`}>
          <h2 className="text-center dark:text-slate-200 text-slate-800 my-2 font-semibold line-clamp-2">
            {product.name}
          </h2>
        </Link>
        <div className="flex items-center justify-between gap-2 pb-3 dark:text-slate-200 text-slate-800">
          <p>UGX {product.productPrice}</p>
          <button className="flex items-center space-x-2 bg-lime-600 px-4 py-2 rounded-md text-white">
            <BaggageClaim />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
