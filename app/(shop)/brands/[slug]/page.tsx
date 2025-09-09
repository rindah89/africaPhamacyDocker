import {
  getGroupedProductsByBrandId,
  getProductsByBrandId,
} from "@/actions/products";
import ProductListing, {
  ProductWithReviews,
} from "@/components/frontend/listings/ProductListing";
import Image from "next/image";
import React from "react";
import { BreadcrumbProps } from "../../product/[slug]/page";
import { CustomBreadCrumb } from "@/components/frontend/CustomBreadCrumb";
import { getAllBrands } from "@/actions/brand";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brandName = slug.split("-").join(" ");
  // const product = await getProductBySlug(slug);
  return {
    title: brandName,
    alternates: {
      canonical: `/brands/${slug}`,
    },
  };
}
// Commented out for Docker builds - uncomment if you need static generation
// export async function generateStaticParams() {
//   try {
//     const brands = (await getAllBrands()) || [];
//     if (brands.length > 0) {
//       return brands.map((brand) => ({
//         slug: brand.slug,
//       }));
//     }
//     return [];
//   } catch (error) {
//     console.log(error);
//     return [];
//   }
// }
export default async function page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { slug } = await params;
  const { id } = searchParams;
  const brandName = slug.split("-").join(" ");
  // Fetch Products by Brand Id
  const groupedProducts =
    (await getGroupedProductsByBrandId(id as string)) || [];
  const breadcrumb: BreadcrumbProps[] = [
    { label: "Home", href: "/" },
    {
      label: "Brands",
      href: `/brands`,
    },
    { label: brandName, href: `/brands/${slug}` },
  ];
  return (
    <>
      <div className="container">
        <div className=" py-8 border-t">
          <CustomBreadCrumb breadcrumb={breadcrumb} />
          <h1 className="scroll-m-20 pt-2 text-4xl font-extrabold tracking-tight lg:text-5xl capitalize">
            {brandName} Store
          </h1>
        </div>
        {groupedProducts && groupedProducts.length > 0 ? (
          <div className="space-y-8">
            {groupedProducts.map((group, i) => {
              return (
                <ProductListing
                  key={i}
                  title={`${group.subCategory.title}(${group.products.length})`}
                  detailLink=""
                  products={group.products}
                  cardType="cart"
                  carousel
                  className="bg-pink-800 text-white border-0"
                />
              );
            })}
          </div>
        ) : (
          <div className=" min-h-96 bg-slate-100 flex items-center justify-center">
            {/* <Image
            src="/placeholder.svg"
            alt=""
            width={300}
            height={300}
            className=""
          /> */}
            <h2 className="py-4 px-6 bg-slate-100">
              This Brand has No Products Yet
            </h2>
          </div>
        )}
      </div>
    </>
  );
}
