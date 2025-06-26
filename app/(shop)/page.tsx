import { getAllAdverts } from "@/actions/advert";
import { getAllBanners } from "@/actions/banner";
import { getAllBrands } from "@/actions/brand";
import { getAllProducts } from "@/actions/products";
import ShopSkeleton from "@/components/ShopSkeleton";
import CategoryListing from "@/components/frontend/CategoryListing";
import Hero from "@/components/frontend/Hero";
import BrandList from "@/components/frontend/listings/BrandList";
import HistoryProductListing from "@/components/frontend/listings/HistoryProductListing";
import ProductListing from "@/components/frontend/listings/ProductListing";
import { Suspense } from "react";

export type BannerProps = {
  title: string;
  link: string;
  imageUrl: string;
};

// Add revalidate to cache the page for 1 hour
export const revalidate = 3600;
export const dynamic = 'force-dynamic';

// Separate data fetching functions with error handling
async function getBanners() {
  try {
    const allBanners = await getAllBanners();
    return (allBanners || [])
      .filter((item) => item.status === true)
      .map((item) => ({
        title: item.title,
        link: item.bannerLink,
        imageUrl: item.imageUrl,
      }));
  } catch (error) {
    console.error('Error fetching banners:', error);
    return [];
  }
}

async function getAdverts() {
  try {
    const allAdverts = await getAllAdverts();
    return (allAdverts || []).filter(
      (item) => item.status === true && item.size === "QUARTER"
    );
  } catch (error) {
    console.error('Error fetching adverts:', error);
    return [];
  }
}

async function getProducts() {
  try {
    const result = await getAllProducts();
    const products = result?.products || [];
    return products.slice(0, 20);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function getBrands() {
  try {
    const brands = await getAllBrands();
    return brands || [];
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
}

// Loading component for each section
function LoadingSection() {
  return <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>;
}

// Individual components for each section
async function HeroSection() {
  const [banners, adverts] = await Promise.all([getBanners(), getAdverts()]);
  return <Hero banners={banners} adverts={adverts} />;
}

async function ProductSection() {
  const products = await getProducts();

  const productSections = [
    {
      title: "Trending Products",
      products: products.slice(0, 6),
      cardType: "horizontal" as const,
      className: "bg-slate-800 text-white border-b-0",
      carousel: false,
    },
    {
      title: "Sponsored Products",
      products: products.slice(6, 12),
      cardType: "vertical" as const,
      className: "",
      carousel: false,
    },
    {
      title: "More Products",
      products: products.slice(12),
      cardType: "vertical" as const,
      className: "bg-slate-800 text-white border-b-0",
      carousel: true,
    },
  ];

  return (
    <div className="space-y-8">
      {productSections
        .filter((section) => section.products.length > 0)
        .map((section, index) => (
          <ProductListing
            key={index}
            title={section.title}
            detailLink="#"
            products={section.products}
            cardType={section.cardType}
            carousel={section.carousel}
            className={section.className}
          />
        ))}
    </div>
  );
}

async function BrandSection() {
  const brands = await getBrands();
  return <BrandList brands={brands} title="Browse By Brands" />;
}

export default async function Home() {
  return (
    <main className="my-8">
      <div className="container">
        <Suspense fallback={<LoadingSection />}>
          <HeroSection />
        </Suspense>

        <section className="py-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            Shop by Category
          </h2>
          <Suspense fallback={<LoadingSection />}>
            <CategoryListing />
          </Suspense>
        </section>

        <section className="py-12 bg-slate-50">
          <Suspense fallback={<LoadingSection />}>
            <ProductSection />
          </Suspense>
        </section>

        <section className="py-12">
          <Suspense fallback={<LoadingSection />}>
            <BrandSection />
          </Suspense>
        </section>

        <section className="py-12 bg-slate-50">
          <h2 className="text-2xl font-bold text-center mb-8">
            Recently Viewed
          </h2>
          <Suspense fallback={<LoadingSection />}>
            <HistoryProductListing />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
