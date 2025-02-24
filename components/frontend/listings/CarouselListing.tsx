"use client";
import { BaggageClaim } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import CarouselProduct from "./CarouselProduct";
import { Product } from "@prisma/client";
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
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 4,
      slidesToSlide: 3, // optional, default to 1.
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 3,
      slidesToSlide: 2, // optional, default to 1.
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 2,
      slidesToSlide: 1, // optional, default to 1.
    },
  };
  return (
    <Carousel
      swipeable={false}
      draggable={false}
      showDots={true}
      responsive={responsive}
      ssr={true} // means to render carousel on server-side.
      infinite={true}
      autoPlay={true}
      autoPlaySpeed={5000}
      keyBoardControl={true}
      customTransition="all .5"
      transitionDuration={1000}
      containerClass="carousel-container"
      removeArrowOnDeviceType={["tablet", "mobile"]}
      dotListClass="custom-dot-list-style"
      itemClass="px-4"
    >
      {products.map((product) => {
        if (cardType === "carousel") {
          return <CarouselProduct product={product} key={product.id} />;
        }
        if (cardType === "cart") {
          return <ProductWithCart item={product} key={product.id} />;
        }
        if (cardType === "horizontal") {
          return <HorizontalProduct product={product} key={product.id} />;
        }
        return <VerticalProduct product={product} key={product.id} />;
      })}
    </Carousel>
  );
}
