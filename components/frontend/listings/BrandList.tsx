import { Brand } from "@prisma/client";
import { MoveRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function BrandList({
  brands,
  title,
  link,
}: {
  brands: Brand[];
  title: string;
  link?: string;
}) {
  return (
    <>
      <div className=" py-3 px-8 flex items-center justify-between rounded  mb-2 bg-slate-800 text-white border-b-0 ">
        <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl ">
          {title}
        </h1>
        {link && (
          <Link className=" flex items-center uppercase" href={link}>
            <span>See All</span>
            <MoveRight className="w-4 h-4 ml-2 flex-shrink-0" />
          </Link>
        )}
      </div>
      <div className="p-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 ">
        {brands.map((brand, index) => {
          return (
            <Link
              href={`/brands/${brand.slug}?id=${brand.id}`}
              key={index}
              className="text-center"
            >
              <Image
                src={brand.logo ?? "/placeholder.svg"}
                alt={brand.title}
                width={200}
                height={200}
                className="h-24 object-cover rounded-md"
              />
              <h2>{brand.title}</h2>
            </Link>
          );
        })}
      </div>
    </>
  );
}
