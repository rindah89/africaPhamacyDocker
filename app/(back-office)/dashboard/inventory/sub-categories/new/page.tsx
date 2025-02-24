import { getAllCategories } from "@/actions/category";
import CategoryForm from "@/components/dashboard/Forms/CategoryForm";
import SubCategoryForm from "@/components/dashboard/Forms/SubCategoryForm";

export default async function page() {
  const allCategories = (await getAllCategories()) || [];
  const categories = allCategories.map((item) => {
    return {
      label: item.title,
      value: item.id,
    };
  });
  return <SubCategoryForm categories={categories} />;
}
