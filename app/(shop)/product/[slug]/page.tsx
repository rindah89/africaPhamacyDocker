import {
  getAllProducts,
  getProductBySlug,
  getSimilarProducts,
} from "@/actions/products";
import { CustomBreadCrumb } from "@/components/frontend/CustomBreadCrumb";
import ProductImageGallery, {
  ImageProps,
} from "@/components/frontend/ProductImageGallery";
import AddToCartButton from "@/components/frontend/listings/AddToCartButton";
import { Button } from "@/components/ui/button";
import { Minus, Plus, RefreshCw, Store, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductListing from "@/components/frontend/listings/ProductListing";
import { Product } from "@prisma/client";
import ProductContent from "@/components/frontend/ProductContent";
import ShareProduct from "@/components/frontend/ShareProduct";
import ProductReviewForm from "@/components/frontend/ProductReviewForm";
import { auth } from "@/auth";
import {
  getApprovedProductReviews,
  getProductReviews,
} from "@/actions/reviews";
import { timeAgo } from "@/lib/timeAgo";
import FormattedAmount from "@/components/frontend/FormattedAmount";

export type BreadcrumbProps = {
  label?: string;
  href: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product?.name,
    description: product?.productDetails,
    alternates: {
      canonical: `/product/${product?.slug}`,
    },
    openGraph: {
      title: product?.name,
      description: product?.productDetails,
      images: [product?.productThumbnail],
    },
  };
}
export async function generateStaticParams() {
  try {
    const products = (await getAllProducts()) || [];
    if (products.length > 0) {
      return products.map((product) => ({
        slug: product.slug,
      }));
    }
    return [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export const dynamic = 'force-dynamic';

export default async function page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const product = await getProductBySlug(slug);
  const productReviews =
    (await getApprovedProductReviews(product?.id ?? "")) || [];
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
  const similarProducts = await getSimilarProducts(
    product?.subCategoryId,
    product?.id
  );

  const averageRating =
    productReviews.reduce((acc, item) => acc + item.rating, 0) /
    productReviews.length;
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
          <div className="col-span-full md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <FormattedAmount amount={product?.productPrice ?? 0} showSymbol={true} />
                  </h2>
                </div>
                <p className="text-muted-foreground">
                  Stock : {product?.stockQty} items
                </p>
              </div>
              <div className="py-4">
                {/* Add to Cart */}
                <AddToCartButton product={product as Product} />
              </div>
              
            </div>
          </div>
          <div className="col-span-full md:col-span-3">
            <div className="rounded shadow p-4">
              <h2 className="pb-2 border-b font-bold text-xl">
                In-Store Pickup and Returns
              </h2>
              <div className="pt-2 space-y-3">
                <div className="flex space-x-2">
                  <Store className="w-6 h-6 flex-shrink-0" />
                  <div className="space-y-1">
                    <h2 className="font-semibold">In-Store Pickup</h2>
                    <div className="text-xs space-y-2">
                      <p>Orders are available for pickup at our pharmacy location.</p>
                      <p>Please ensure to bring your order confirmation and valid ID.</p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <RefreshCw className="w-6 h-6 flex-shrink-0" />
                  <div className="space-y-1">
                    <h2 className="font-semibold">Return Policy</h2>
                    <div className="text-xs space-y-2">
                      <h3 className="font-semibold">
                        In-Store Return Policy
                      </h3>
                      <p>
                        For details about in-store returns, please visit
                        - Karen Pharmacy Return Policy
                      </p>
                    </div>
                  </div>
                </div>
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
                    returnUrl={`/product/${slug}`}
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
                    returnUrl={`/product/${slug}`}
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {similarProducts && similarProducts.length > 0 && (
        <div className="pt-16 ">
          <ProductListing
            title="Similar Products"
            detailLink="#"
            products={similarProducts}
            className=""
          />
        </div>
      )}
    </div>
  );
}
