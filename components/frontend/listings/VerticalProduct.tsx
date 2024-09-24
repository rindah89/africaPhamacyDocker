"use client";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/redux/hooks/hooks";
import { addProductToHistory } from "@/redux/slices/historySlice";
import { Product } from "@prisma/client";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaStar } from "react-icons/fa";
import FormattedAmount from "../FormattedAmount";
export default function VerticalProduct({
  product,
  scrollable = false,
}: {
  product: Product;
  scrollable?: boolean;
}) {
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
    <Link
      onClick={handleAdd}
      href={`/product/${product.slug}`}
      className="flex flex-col space-x-2 p-3 rounded-sm shadow border items-center justify-center hover:shadow-md transition-all duration-500"
    >
      <Image
        src={product.productThumbnail}
        width={500}
        height={500}
        alt="watch"
        className="w-full h-40 object-contain flex-shrink-0"
      />
      <div className="">
        <h2
          className={cn(
            "font-semibold text-base line-clamp-2",
            scrollable && "truncate truncate-20"
          )}
        >
          {product.name}
        </h2>
        <div className="flex items-center space-x-2">
          <FormattedAmount amount={product.productPrice} showSymbol={true} className="text-[1.5rem]" />
          <s className="text-muted-foreground">
            <FormattedAmount amount={product.productCost} showSymbol={false} />
          </s>
          <p className="bg-pink-50 w-14 h-8 flex items-center justify-center rounded-full text-pink-600 text-sm">
            -10%
          </p>
        </div>
        <p className="text-sm text-green-600 font-semibold">
          You save {product.productPrice - product.productCost} FCFA
        </p>
        <div className="flex space-x-2 items-center">
          <div className="flex items-center space-x-1 text-orange-500">
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
          </div>
          <p className="text-xs">1 Review</p>
        </div>
      </div>
    </Link>
  );
}
