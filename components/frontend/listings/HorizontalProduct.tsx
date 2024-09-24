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
import { ProductWithReviews } from "./ProductListing";
export default function HorizontalProduct({
  product,
  scrollable = false,
}: {
  product: ProductWithReviews;
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
  const productReviews = product.reviews ?? [];
  const averageRating =
    Math.round(
      productReviews.reduce((acc, item) => acc + item.rating, 0) /
        productReviews.length
    ) || 0;
  return (
    <Link
      onClick={handleAdd}
      href={`/product/${product.slug}`}
      className="flex space-x-2 p-3 rounded-sm shadow border hover:shadow-md transition-all duration-500 overflow-hidden"
    >
      <Image
        src={product.productThumbnail}
        width={500}
        height={500}
        alt="watch"
        className="w-20 h-20 object-cover flex-shrink-0"
      />
      <div className="">
        <h2
          className={cn(
            "font-semibold text-base line-clamp-2",
            scrollable && "truncate truncate-40 text-wrap"
          )}
        >
          {product.name}
        </h2>
        <div className="flex items-center space-x-2">
          <p className="font-semibold text-[1.5rem]">{product.productPrice.toLocaleString('fr-CM')} FCFA</p>
          <s className="text-muted-foreground">{product.productCost.toLocaleString('fr-CM')} FCFA</s>
          <p className="bg-pink-50 w-14 h-8 flex items-center justify-center rounded-full text-pink-600 text-sm">
            -10%
          </p>
        </div>
        <p className="text-sm text-green-600 font-semibold">
              You save {(product.productPrice - product.productCost).toLocaleString('fr-CM')}. FCFA
        </p>
        {product?.reviews && product.reviews.length > 0 && (
          <div className="flex space-x-2 items-center">
            <div className="flex items-center space-x-1 text-orange-500">
              {[...Array(averageRating)].map((_, i) => {
                return <FaStar key={i} />;
              })}
              {/* {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-6 h-6 ${
                        i < averageRating ? "text-yellow-500" : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 .587l3.668 7.568L24 9.423l-6 5.854 1.417 8.148L12 18.896l-7.417 4.53L6 15.277 0 9.423l8.332-1.268L12 .587z" />
                    </svg>
                  ))} */}
            </div>
            <p className="text-xs">{product.reviews.length} Reviews</p>
          </div>
        )}
      </div>
    </Link>
  );
}
