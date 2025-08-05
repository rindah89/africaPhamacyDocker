import { getPopulatedMainCategories } from "@/actions/main-category";
import { getAllProducts, getSearchProducts } from "@/actions/products";
import { CategoryHeader } from "@/components/frontend/CategoryHeader";
import CategoryHeaderMobile from "@/components/frontend/CategoryHeaderMobile";
import Footer from "@/components/global/Footer";
import ShopHeader from "@/components/global/ShopHeader";
import { auth } from "@/auth";
import React, { ReactNode } from "react";

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await auth();
  const populatedCategories = await getPopulatedMainCategories();
  const products = (await getSearchProducts()) || [];

  return (
    <div>
      <ShopHeader products={products} session={session} />
      <div className="hidden sm:block sm:container max-w-6xl mx-auto py-4">
        {populatedCategories && populatedCategories.length > 0 && (
          <CategoryHeader mainCategories={populatedCategories} />
        )}
      </div>
      <div className="block sm:hidden sm:container max-w-6xl mx-auto py-4">
        <CategoryHeaderMobile />
      </div>

      {children}
      <Footer />
    </div>
  );
}
