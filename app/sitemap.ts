//app/sitemap.js
import { getAllBrands } from "@/actions/brand";
import { getAllCategories } from "@/actions/category";
import { getAllMainCategories } from "@/actions/main-category";
import { getAllProducts } from "@/actions/products";
import { getAllSubCategories } from "@/actions/sub-category";
import { siteConfig } from "@/config/site";

export default async function sitemap() {
  const baseUrl = siteConfig.url;

  try {
    const brands = (await getAllBrands()) || [];
    const products = (await getAllProducts()) || [];
    const categories = (await getAllCategories()) || [];
    const mainCategories = (await getAllMainCategories()) || [];
    const subCategories = (await getAllSubCategories()) || [];
    
    const productUrls = Array.isArray(products) ? products.map((product) => {
      return {
        url: `${baseUrl}/product/${product.slug}`,
        lastModified: new Date(),
      };
    }) : [];
    
    const categoryUrls = Array.isArray(categories) ? categories.map((category) => {
      return {
        url: `${baseUrl}/categories/${category.slug}?type=cat`,
        lastModified: new Date(),
      };
    }) : [];
    
    const brandUrls = Array.isArray(brands) ? brands.map((brand) => {
      return {
        url: `${baseUrl}/brands/${brand.slug}?id=${brand.id}`,
        lastModified: new Date(),
      };
    }) : [];
    
    const mainCategoryUrls = Array.isArray(mainCategories) ? mainCategories.map((category) => {
      return {
        url: `${baseUrl}/categories/${category.slug}?type=main`,
        lastModified: new Date(),
      };
    }) : [];
    
    const subCategoryUrls = Array.isArray(subCategories) ? subCategories.map((category) => {
      return {
        url: `${baseUrl}/categories/${category.slug}?type=sub`,
        lastModified: new Date(),
      };
    }) : [];

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
      },
      ...productUrls,
      ...mainCategoryUrls,
      ...categoryUrls,
      ...subCategoryUrls,
      ...brandUrls,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return basic sitemap if there's an error
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
      },
    ];
  }
}
