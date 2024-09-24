"use client";
import React from "react";
import ProductListing, { ProductWithReviews } from "./ProductListing";
import { useAppSelector } from "@/redux/hooks/hooks";
import { Product } from "@prisma/client";

export default function HistoryProductListing() {
  const historyItems = useAppSelector((state) => state.history.historyItems);
  return (
    <div>
      {historyItems && historyItems.length > 0 && (
        <ProductListing
          title="Your Browsing History"
          detailLink=""
          products={historyItems as ProductWithReviews[]}
          carousel
          cardType="cart"
        />
      )}
    </div>
  );
}
