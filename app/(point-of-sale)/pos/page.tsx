import { getAllCategories } from "@/actions/category";
import { getAllCustomers } from "@/actions/customer";
import { getProductsByCategoryId} from "@/actions/products";
import { getAllSubCategories } from "@/actions/sub-category";
import { getAllUsers } from "@/actions/users";
import AuthorizePageWrapper from "@/components/dashboard/Auth/AuthorizePageWrapper";
import PointOfSale from "@/components/POS/PointOfSale";
import PaymentModal from "@/components/POS/PaymentModal";
import { permissionsObj } from "@/config/permissions";
import { getPrefetchedProducts, getCachedSearchResults } from "@/lib/prefetch";

export default async function page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { cat = "all", page = "1", limit = "50", search } = searchParams;
  
  // Run queries in parallel using Promise.all and use prefetched products
  const [allCategories, products, allCustomers] = await Promise.all([
    getAllCategories(),
    search 
      ? getCachedSearchResults(search as string)
      : cat === "all" 
        ? (await getPrefetchedProducts()).products 
        : getProductsByCategoryId(cat as string, parseInt(page as string), parseInt(limit as string)),
    getAllUsers({ limit: 100 })
  ]);

  const customers = (allCustomers || []).map((item) => ({
    label: item.name,
    value: item.id,
    email: item.email,
  }));

  return (
    <AuthorizePageWrapper requiredPermission={permissionsObj.canViewPos}>
      <div className="">
        <PointOfSale
          customers={customers}
          categories={allCategories || []}
          products={products || []}
          selectedCatId={cat as string}
          currentPage={parseInt(page as string)}
          hasMore={!search && products && products.length === parseInt(limit as string)}
          searchQuery={search as string}
        />
      </div>
    </AuthorizePageWrapper>
  );
}
