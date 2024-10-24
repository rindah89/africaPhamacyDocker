import { getAllMainCategories } from "@/actions/main-category";
import CategoryForm from "@/components/dashboard/Forms/CategoryForm";

export default async function page() {
  const allMainCategories = (await getAllMainCategories()) || [];
  const mainCategories = allMainCategories.map((item) => {
    return {
      label: item.title,
      value: item.id,
    };
  });
  return <CategoryForm mainCategories={mainCategories} />;
}
