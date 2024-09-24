import { Button } from "@/components/ui/button";
import { MoveRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import HorizontalProduct from "./HorizontalProduct";
import { Product, Review } from "@prisma/client";
import VerticalProduct from "./VerticalProduct";
import ProductWithCart from "./ProductWithCart";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import CarouselListing from "./CarouselListing";
import { cn } from "@/lib/utils";
import { GroupedProducts } from "@/actions/products";
export interface ProductWithReviews extends Product {
  reviews: Review[];
}
type ProductListingProps = {
  title: string;
  detailLink: string;
  products: ProductWithReviews[];
  cardType?: "horizontal" | "vertical" | "cart" | "carousel";
  scrollable?: boolean;
  carousel?: boolean;
  className?: string;
};
export default function ProductListing({
  title,
  detailLink,
  products: allProducts,
  scrollable = false,
  carousel = false,
  cardType = "horizontal",
  className,
}: ProductListingProps) {
  const products = allProducts.filter((item) => item.stockQty > 0);
  return (
    <div>
      {/* Header */}
      <div
        className={cn(
          "py-3 px-8 flex items-center justify-between rounded border-b mb-2",
          className
        )}
      >
        <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl ">
          {title}
        </h1>
        {detailLink && (
          <Link className=" flex items-center uppercase" href={detailLink}>
            <span>See All</span>
            <MoveRight className="w-4 h-4 ml-2 flex-shrink-0" />
          </Link>
        )}
      </div>
      {/*  */}
      <>
        {carousel ? (
          <div className="bg-white dark:bg-slate-900 p-4">
            <CarouselListing cardType={cardType} products={products} />
          </div>
        ) : (
          <>
            {cardType === "horizontal" ? (
              <>
                {scrollable ? (
                  <ScrollArea className="w-full whitespace-nowrap rounded-md px-4">
                    <div className="flex gap-6 items-center py-3 border-b">
                      {products.map((product) => {
                        return (
                          <HorizontalProduct
                            key={product.id}
                            product={product}
                            scrollable
                          />
                        );
                      })}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-4 gap-6">
                    {products.map((product) => {
                      return (
                        <HorizontalProduct key={product.id} product={product} />
                      );
                    })}
                  </div>
                )}
              </>
            ) : cardType === "vertical" ? (
              <>
                {scrollable ? (
                  <ScrollArea className="w-full whitespace-nowrap rounded-md px-4">
                    <div className="flex gap-6 items-center py-3 border-b">
                      {products.map((product) => {
                        return (
                          <VerticalProduct
                            scrollable
                            key={product.id}
                            product={product}
                          />
                        );
                      })}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 p-4 gap-6">
                    {products.map((product) => {
                      return (
                        <VerticalProduct key={product.id} product={product} />
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <>
                {scrollable ? (
                  <ScrollArea className="w-full whitespace-nowrap rounded-md px-4">
                    <div className="flex gap-6 items-center py-3 border-b">
                      {products.map((product) => {
                        return (
                          <ProductWithCart
                            scrollable
                            key={product.id}
                            item={product}
                          />
                        );
                      })}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 py-6 px-4">
                    {products.map((product) => {
                      return (
                        <ProductWithCart key={product.id} item={product} />
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </>
    </div>
  );
}
