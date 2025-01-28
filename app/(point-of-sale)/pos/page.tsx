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
  const { cat = "all" } = searchParams;
  const allCategories = (await getAllCategories()) || [];
  const products = (await getProductsByCategoryId(cat as string)) || [];
  const allCustomers = (await getAllUsers()) || [];
  const customers = allCustomers.map((item) => {
    return {
      label: item.name,
      value: item.id,
      email: item.email,
    };
  });

  return (
    <AuthorizePageWrapper requiredPermission={permissionsObj.canViewPos}>
      <div className="">
        <PointOfSale
          customers={customers}
          categories={allCategories}
          products={products}
          selectedCatId={cat as string}
        />
      </div>
    </AuthorizePageWrapper>
  );
}
