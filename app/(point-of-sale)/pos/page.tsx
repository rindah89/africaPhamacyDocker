import { Suspense } from "react";
import { getAllCategories } from "@/actions/category";
import { getAllCustomers } from "@/actions/customer";
import { getProductsByCategoryId} from "@/actions/products";
import { getAllUsers } from "@/actions/users";
import AuthorizePageWrapper from "@/components/dashboard/Auth/AuthorizePageWrapper";
import PointOfSale from "@/components/POS/PointOfSale";
import { permissionsObj } from "@/config/permissions";
import Loading from "./loading";

async function POSContent({ cat }: { cat: string }) {
  const [allCategories, products, allCustomers] = await Promise.all([
    getAllCategories(),
    getProductsByCategoryId(cat),
    getAllUsers()
  ]);

  const customers = (allCustomers || []).map((item) => ({
    label: item.name,
    value: item.id,
    email: item.email,
  }));

  return (
    <PointOfSale
      customers={customers}
      categories={allCategories || []}
      products={products || []}
      selectedCatId={cat}
    />
  );
}

export default async function POSPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { cat = "all" } = searchParams;

  return (
    <AuthorizePageWrapper requiredPermission={permissionsObj.canViewPos}>
      <Suspense fallback={<Loading />}>
        <POSContent cat={cat as string} />
      </Suspense>
    </AuthorizePageWrapper>
  );
}
