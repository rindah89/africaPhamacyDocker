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
  return (
    <>
      <ProductListing
        title="Trending Products"
        detailLink="#"
        cardType="horizontal"
        products={products.slice(0, 6)}
        className="bg-slate-800 text-white border-b-0"
      />
      <ProductListing
        title="Sponsored Products"
        detailLink="#"
        products={products.slice(6, 12)}
        cardType="vertical"
      />
      <ProductListing
        title="More Products"
        detailLink="#"
        products={products.slice(12)}
        carousel
        cardType="vertical"
        className="bg-slate-800 text-white border-b-0"
      />
    </>
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
        
        <div className="space-y-8 py-8">
          <Suspense fallback={<LoadingSection />}>
            <CategoryListing />
          </Suspense>

          <Suspense fallback={<LoadingSection />}>
            <ProductSection />
          </Suspense>

          <Suspense fallback={<LoadingSection />}>
            <BrandSection />
          </Suspense>

          <Suspense fallback={<LoadingSection />}>
            <HistoryProductListing />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
