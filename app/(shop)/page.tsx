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

export type BannerProps = {
  title: string;
  link: string;
  imageUrl: string;
};
export default async function Home() {
  const allBanners = (await getAllBanners()) || [];
  const brands = (await getAllBrands()) || [];
  const allAdverts = (await getAllAdverts()) || [];
  const banners = allBanners
    .filter((item) => item.status === true)
    .map((item) => {
      return {
        title: item.title,
        link: item.bannerLink,
        imageUrl: item.imageUrl,
      };
    });
  const adverts = allAdverts.filter(
    (item) => item.status === true && item.size === "QUARTER"
  );
  const products = (await getAllProducts()) || [];
  return (
    <main className="my-8">
      <div className="container">
        <Hero banners={banners} adverts={adverts} />
        <div className="space-y-8 py-8">
          <CategoryListing />
          {/* Todays Deals */}
          <ProductListing
            title="Trending Products"
            detailLink="#"
            cardType="horizontal"
            products={products.slice(0, 6)}
            className="bg-slate-800 text-white border-b-0 "
          />
          <ProductListing
            title="Sponsored Products"
            detailLink="#"
            products={products.slice(7, 13)}
            cardType="vertical"
          />
          <ProductListing
            title="Same Day Delivery (EasyNow)"
            detailLink="#"
            products={products.slice(8, 19)}
            cardType="cart"
            scrollable
            className="bg-slate-800 text-white border-b-0 "
          />
          <BrandList brands={brands} title="Browse By Brands" />
          <ProductListing
            title="Same Day Delivery (EasyNow)"
            detailLink="#"
            products={products.slice(8, 19)}
            carousel
            cardType="cart"
          />
          <ProductListing
            title="Trending Products"
            detailLink="#"
            products={products.slice(8, 19)}
            carousel
            cardType="vertical"
            className="bg-slate-800 text-white border-b-0 "
          />
          <HistoryProductListing />
        </div>
      </div>
    </main>
  );
}
