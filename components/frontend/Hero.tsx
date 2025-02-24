"use client";
import React from "react";
import Carousel from "nuka-carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BannerProps } from "@/app/(shop)/page";

type HeroProps = {
  banners: BannerProps[];
  adverts: BannerProps[];
};
export default function Hero({ banners, adverts }: HeroProps) {
  const config = {
    nextButtonClassName: "rounded-full",
    nextButtonText: <ChevronRight />,
    pagingDotsClassName: "me-2 w-4 h-4",
    prevButtonClassName: "rounded-full",
    prevButtonText: <ChevronLeft />,
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="sm:col-span-8 col-span-full">
        <Carousel
          defaultControlsConfig={config}
          autoplay
          className="rounded-md overflow-hidden"
          wrapAround
        >
          {banners.map((banner, i) => {
            return (
              <Link key={i} href={banner.link} className="">
                <Image
                  width={712}
                  height={384}
                  src={banner.imageUrl}
                  className="w-full"
                  alt={banner.title}
                />
              </Link>
            );
          })}
        </Carousel>
      </div>
      <div className="sm:col-span-4 col-span-full">
        <div className="grid grid-cols-2 gap-4">
          {adverts.map((advert, i) => {
            return (
              <Link key={i} href={advert.link} className="">
                <Image
                  width={712}
                  height={384}
                  src={advert.imageUrl}
                  className="w-full"
                  alt={advert.title}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
