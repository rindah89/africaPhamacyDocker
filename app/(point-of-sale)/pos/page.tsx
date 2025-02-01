import { getAllCategories } from "@/actions/category";
import { getAllCustomers } from "@/actions/customer";
import { getProductsByCategoryId} from "@/actions/products";
import { getAllSubCategories } from "@/actions/sub-category";
import { getAllUsers } from "@/actions/users";
import AuthorizePageWrapper from "@/components/dashboard/Auth/AuthorizePageWrapper";
import PointOfSale from "@/components/POS/PointOfSale";
import PaymentModal from "@/components/POS/PaymentModal";
import { permissionsObj } from "@/config/permissions";

export default async function page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { cat = "all", page = "1", limit = "50" } = searchParams;
  
  // Run queries in parallel using Promise.all
  const [allCategories, products, allCustomers] = await Promise.all([
    getAllCategories(),
    getProductsByCategoryId(cat as string, parseInt(page as string), parseInt(limit as string)),
    getAllUsers({ limit: 100 }) // Limit initial customer load
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
          hasMore={products && products.length === parseInt(limit as string)}
        />
      </div>
    </AuthorizePageWrapper>
  );
}
