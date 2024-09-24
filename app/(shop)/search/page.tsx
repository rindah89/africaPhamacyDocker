import React from "react";

import { CustomBreadCrumb } from "@/components/frontend/CustomBreadCrumb";
import {
  getProductsByCategorySlug,
  getProductsBySearchQuery,
} from "@/actions/products";
import VerticalProduct from "@/components/frontend/listings/VerticalProduct";
import ProductWithCart from "@/components/frontend/listings/ProductWithCart";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PriceRange from "@/components/frontend/PriceRange";
import Paginate from "@/components/frontend/Paginate";
import { BreadcrumbProps } from "../product/[slug]/page";
import { getAllCategories } from "@/actions/category";
import { Product } from "@prisma/client";
import SearchPriceRange from "@/components/frontend/SearchPriceRange";
export default async function page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const categories = (await getAllCategories()) || [];
  const { query, sort = "asc", min, max } = searchParams;
  console.log(min, max);
  // const categoryName = query.split("-").join(" ");
  const breadcrumb: BreadcrumbProps[] = [
    { label: "Home", href: "/" },
    { label: query as string, href: `/search?query=${query}` },
  ];
  const data = await getProductsBySearchQuery(
    query as string,
    sort as "asc" | "desc",
    Number(min),
    Number(max)
  );

  // console.log(products);
  return (
    <div className="container">
      <div className=" py-4 border-t">
        <div className="flex items-center justify-between mb-4">
          <CustomBreadCrumb breadcrumb={breadcrumb} />
        </div>
        <div className="flex items-center justify-between">
          <h1 className="scroll-m-20 pt-2 text-3xl lg:text-4xl font-extrabold tracking-tight  capitalize">
            Search results for <span>{query}</span>({data.length})
          </h1>
          {/* <div className="flex space-x-3 items-center">
            <p className="font-semibold">Sort By:</p>
            <Button
              asChild
              variant={sort === "desc" ? "default" : "outline"}
              size={"sm"}
            >
              <Link href={`/search?query=${query}&&sort=desc`}>
                Price - High to Low
              </Link>
            </Button>
            <Button
              asChild
              variant={sort === "asc" ? "default" : "outline"}
              size={"sm"}
            >
              <Link href={`/search?query=${query}&&sort=asc`}>
                Price - Low to High
              </Link>
            </Button>
          </div> */}
        </div>
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-full lg:col-span-3 shadow-sm border p-4 rounded ">
          {categories && categories.length > 0 && (
            <div className="">
              <h2 className="font-bold mb-3">Browse Categories</h2>
              <div className="flex flex-col text-sm border-b mb-3 pb-3 space-y-2 ">
                {categories.map((cat) => {
                  return (
                    <Link
                      key={cat.slug}
                      className="hover:text-blue-600 duration-500 transition-all"
                      href={`/categories/${cat.slug}?type=cat`}
                    >
                      {cat.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
          <div className="">
            <h2 className="font-bold mb-3">Price</h2>
            <div className="">
              <SearchPriceRange />
            </div>
          </div>
        </div>
        <div className="col-span-full lg:col-span-9 shadow-sm  p-4 rounded ">
          {data && data.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                {data.map((product) => {
                  return <ProductWithCart key={product.id} item={product} />;
                })}
              </div>
            </>
          ) : (
            <div className="">
              <h2>No Products</h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
