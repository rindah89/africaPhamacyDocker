import {
  getAllProducts,
  getProductBySlug,
  getProductDetails,
  getSimilarProducts,
} from "@/actions/products";
import { CustomBreadCrumb } from "@/components/frontend/CustomBreadCrumb";
import ProductImageGallery, {
  ImageProps,
} from "@/components/frontend/ProductImageGallery";
import AddToCartButton from "@/components/frontend/listings/AddToCartButton";
import { Button } from "@/components/ui/button";
import { Minus, Plus, RefreshCw, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Product } from "@prisma/client";
import ProductContent from "@/components/frontend/ProductContent";
import ShareProduct from "@/components/frontend/ShareProduct";
import ProductReviewForm from "@/components/frontend/ProductReviewForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/authOptions";
import { getProductReviews } from "@/actions/reviews";
import { timeAgo } from "@/lib/timeAgo";
import ReviewApproveBtn from "@/components/ReviewApproveBtn";

export type BreadcrumbProps = {
  label?: string;
  href: string;
};

export default async function page({
  params: { id },
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const product = await getProductDetails(id);
  const productReviews = (await getProductReviews(product?.id ?? "")) || [];
  const breadcrumb: BreadcrumbProps[] = [
    { label: "Home", href: "/" },
    {
      label: product?.subCategory?.category?.mainCategory.title,
      href: `/category/${product?.subCategory.category.mainCategory.slug}`,
    },
    {
      label: product?.subCategory?.category?.title,
      href: `/category/${product?.subCategory.category.slug}`,
    },
    {
      label: product?.subCategory?.title,
      href: `/category/${product?.subCategory.slug}`,
    },
    { label: product?.name, href: `/product/${product?.slug}` },
  ];
  const images = product?.productImages.map((item) => {
    return {
      original: item,
      thumbnail: item,
    };
  }) || [
    {
      original: "/placeholder.svg",
      thumbnail: "/placeholder.svg",
    },
  ];

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const url = `${baseUrl}/product/${product?.slug}`;

  const averageRating = Math.round(
    productReviews.reduce((acc, item) => acc + item.rating, 0) /
      productReviews.length
  );
  // console.log(similarProducts);
  return (
    <div className="sm:container max-w-6xl mx-auto">
      <div className=" pt-4 border-t">
        <CustomBreadCrumb breadcrumb={breadcrumb} />
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl pt-3 pb-4">
          {product?.subCategory.title}
        </h1>
      </div>
      <div className="mt-4">
        <div className="grid grid-cols-12 gap-6 lg:gap-8">
          <div className="col-span-full md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="">
              <ProductImageGallery images={images} />
            </div>
            <div className="">
              <div className="border-b pb-3">
                <h2 className="text-xl font-bold">{product?.name}</h2>
                <p className="text-muted-foreground">
                  Product Code : {product?.productCode}
                </p>
                <p className="text-muted-foreground">
                  Brand : {product?.brand.title}
                </p>
              </div>
              <div className="border-b flex items-center space-x-2 justify-between py-4">
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-semibold">
                          {product?.productPrice.toLocaleString('fr-CM', { style: 'currency', currency: 'XAF' })}
                        </h2>
                        <s>{product?.productCost.toLocaleString('fr-CM', { style: 'currency', currency: 'XAF' })}</s>
                    </div>
                <p className="text-muted-foreground">
                  Stock : {product?.stockQty} items
                </p>
              </div>
              <div className="py-4">
                {/* Add to Cart */}
                <AddToCartButton product={product as Product} />
              </div>
              <div className="flex  space-x-4">
                <div className="">
                  <Link
                    href="#"
                    className="bg-pink-50 flex flex-col py-3 border px-6 rounded"
                  >
                    <span className="text-pink-800 font-bold">
                      Call us for Bulk Purchases:
                    </span>{" "}
                    <span className="text-slate-900">+237 699 78 30 99</span>
                  </Link>
                </div>
                <ShareProduct productUrl={url} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-4 mt-4 border-t">
        <Tabs defaultValue="content" className="w-full">
          <TabsList>
            <TabsTrigger value="content">Product Details</TabsTrigger>
            <TabsTrigger value="description">Product Description</TabsTrigger>
            <TabsTrigger value="reviews">Product Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="content">
            <ProductContent codeString={product?.content} />
          </TabsContent>
          <TabsContent value="description">
            {product?.productDetails}
          </TabsContent>
          <TabsContent value="reviews">
            {productReviews && productReviews.length > 0 ? (
              <div className="px-8 max-w-4xl ">
                <h2>Reviews</h2>
                <div className="py-3">
                  <h2 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                    {averageRating.toFixed(1)}
                  </h2>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-6 h-6 ${
                        i < averageRating ? "text-yellow-500" : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 .587l3.668 7.568L24 9.423l-6 5.854 1.417 8.148L12 18.896l-7.417 4.53L6 15.277 0 9.423l8.332-1.268L12 .587z" />
                    </svg>
                  ))}
                </div>
                <p>based on {productReviews.length} reviews</p>

                <div className="py-6 space-y-6">
                  {productReviews.map((item) => {
                    return (
                      <div key={item.id} className="">
                        <div className="flex pb-3 justify-between">
                          <div className="flex items-center space-x-3">
                            <Image
                              src={item.image ?? "/placeholder.svg"}
                              alt={item.name ?? ""}
                              className="w-12 h-12 rounded-lg"
                              width={200}
                              height={200}
                            />
                            <div className="">
                              <h2>{item.name}</h2>
                              <div className="flex items-end space-x-2">
                                <div className="flex">
                                  {[...Array(item.rating)].map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`w-5 h-5 text-yellow-500`}
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M12 .587l3.668 7.568L24 9.423l-6 5.854 1.417 8.148L12 18.896l-7.417 4.53L6 15.277 0 9.423l8.332-1.268L12 .587z" />
                                    </svg>
                                  ))}
                                </div>
                                <p>{item.rating.toFixed(1)}</p>
                              </div>
                            </div>
                          </div>
                          <div className="">
                            <p>{timeAgo(item.createdAt)}</p>
                            <ReviewApproveBtn
                              id={item.id}
                              status={item.status}
                            />
                          </div>
                        </div>
                        <p>{item.comment}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="py-6">
                  <ProductReviewForm
                    productId={product?.id ?? ""}
                    session={session}
                    returnUrl={`/product/${product?.slug}`}
                  />
                </div>
              </div>
            ) : (
              <div className="">
                <h2>No Product Reviews</h2>
                <div className="py-6">
                  <ProductReviewForm
                    productId={product?.id ?? ""}
                    session={session}
                    returnUrl={`/product/${product?.slug}`}
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
