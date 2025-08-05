"use client";
import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import CarouselProduct from "./CarouselProduct";
import ProductWithCart from "./ProductWithCart";
import HorizontalProduct from "./HorizontalProduct";
import VerticalProduct from "./VerticalProduct";
import { ProductWithReviews } from "./ProductListing";

export default function CarouselListing({
  products,
  cardType,
}: {
  products: ProductWithReviews[];
  cardType?: "horizontal" | "vertical" | "cart" | "carousel";
}) {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {products.map((product) => (
          <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
            {cardType === "carousel" && <CarouselProduct product={product} />}
            {cardType === "cart" && <ProductWithCart item={product} />}
            {cardType === "horizontal" && <HorizontalProduct product={product} />}
            {(cardType === "vertical" || !cardType) && <VerticalProduct product={product} />}
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
    </Carousel>
  );
}
