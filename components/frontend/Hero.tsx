"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BannerProps } from "@/app/(shop)/page";

type HeroProps = {
  banners: BannerProps[];
  adverts: BannerProps[];
};
export default function Hero({ banners, adverts }: HeroProps) {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="sm:col-span-8 col-span-full">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          loop={true}
          className="rounded-md overflow-hidden"
        >
          {banners.map((banner, i) => {
            return (
              <SwiperSlide key={i}>
                <Link href={banner.link} className="relative block">
                  <Image
                    width={712}
                    height={384}
                    src={banner.imageUrl}
                    className="w-full"
                    alt={banner.title}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-start justify-center p-8 text-white">
                    <h2 className="text-3xl font-bold mb-4">{banner.title}</h2>
                    <button className="bg-white text-slate-800 px-6 py-2 rounded-full font-semibold hover:bg-opacity-90">
                      Shop Now
                    </button>
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
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
