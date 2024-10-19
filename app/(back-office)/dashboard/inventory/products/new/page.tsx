import { getAllBrands } from "@/actions/brand";
import { getAllCategories } from "@/actions/category";
import { getAllSubCategories } from "@/actions/sub-category";
import { getAllSuppliers } from "@/actions/supplier";
import { getAllUnits } from "@/actions/unit";
import ProductForm from "@/components/dashboard/Forms/ProductForm";

export default async function page() {
  const allSubCategories = (await getAllSubCategories()) || [];
  const allBrands = (await getAllBrands()) || [];
  const allSuppliers = (await getAllSuppliers()) || [];
  const allUnits = (await getAllUnits()) || [];
  const categories = allSubCategories.map((item) => {
    return {
      label: item.title,
      value: item.id,
    };
  });

  const brands = allBrands.map((item) => {
    return {
      label: item.title,
      value: item.id,
    };
  });
  const suppliers = allSuppliers.map((item) => {
    return {
      label: item.name,
      value: item.id,
    };
  });
  const units = allUnits.map((item) => {
    return {
      label: `${item.title}(${item.abbreviation})`,
      value: item.id,
    };
  });
  return (
    <ProductForm
      categories={categories}
      brands={brands}
      suppliers={suppliers}
      units={units}
    />
  );
}
