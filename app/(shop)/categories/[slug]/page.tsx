import React from "react";
import { BreadcrumbProps } from "../../product/[slug]/page";
import { CustomBreadCrumb } from "@/components/frontend/CustomBreadCrumb";
import { getProductsByCategorySlug } from "@/actions/products";
import VerticalProduct from "@/components/frontend/listings/VerticalProduct";
import ProductWithCart from "@/components/frontend/listings/ProductWithCart";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PriceRange from "@/components/frontend/PriceRange";
import Paginate from "@/components/frontend/Paginate";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categoryName = slug.split("-").join(" ");
  // const product = await getProductBySlug(slug);
  return {
    title: categoryName,
    alternates: {
      canonical: `/categories/${slug}`,
    },
  };
}
export default async function page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { slug } = await params;
  const { type, sort, min, max, page = 1 } = searchParams;
  console.log(min, max);
  const categoryName = slug.split("-").join(" ");
  const breadcrumb: BreadcrumbProps[] = [
    { label: "Home", href: "/" },
    { label: categoryName, href: `/categories/${slug}?type=${type}` },
  ];

  // Create function that fetches products by catSlug,type
  const pageSize = 10;
  const data = await getProductsByCategorySlug(
    slug,
    type as string,
    Number(page),
    pageSize,
    sort as "asc" | "desc",
    Number(min),
    Number(max)
  );
  const products = data?.products;
  const categories = data?.categories;
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  // console.log(products);
  const startRange = (Number(page) - 1) * pageSize + 1;
  const endRange = Math.min(Number(page) * pageSize, totalCount);
  return (
    <div className="container">
      <div className=" py-4 border-t">
        <div className="flex items-center justify-between mb-4">
          <CustomBreadCrumb breadcrumb={breadcrumb} />

          <div className="text-xs">
            {startRange}-{endRange} of {totalCount} results
          </div>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="scroll-m-20 pt-2 text-3xl lg:text-4xl font-extrabold tracking-tight  capitalize">
            {categoryName}({totalCount})
          </h1>
          <div className="flex space-x-3 items-center">
            <p className="font-semibold">Sort By:</p>
            <Button
              asChild
              variant={sort === "desc" ? "default" : "outline"}
              size={"sm"}
            >
              <Link href={`/categories/${slug}?type=${type}&&sort=desc`}>
                Price - High to Low
              </Link>
            </Button>
            <Button
              asChild
              variant={sort === "asc" ? "default" : "outline"}
              size={"sm"}
            >
              <Link href={`/categories/${slug}?type=${type}&&sort=asc`}>
                Price - Low to High
              </Link>
            </Button>
          </div>
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
                      href={`/categories/${cat.slug}?type=${cat.type}`}
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
              <PriceRange />
            </div>
          </div>
        </div>
        <div className="col-span-full lg:col-span-9 shadow-sm  p-4 rounded ">
          {products && products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => {
                  return <ProductWithCart key={product.id} item={product} />;
                })}
              </div>
              {/* Pagination */}
              <div className="py-6">
                <Paginate totalPages={totalPages} />
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
