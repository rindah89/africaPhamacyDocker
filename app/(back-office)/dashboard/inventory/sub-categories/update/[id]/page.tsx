import { getAllCategories } from "@/actions/category";
import SubCategoryForm from "@/components/dashboard/Forms/SubCategoryForm";
import { getSubCategoryById } from "@/actions/sub-category";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const subCategory = await getSubCategoryById(id);
  const allCategories = (await getAllCategories()) || [];
  const categories = allCategories.map((item) => {
    return {
      label: item.title,
      value: item.id,
    };
  });
  return (
    <SubCategoryForm
      categories={categories}
      editingId={id}
      initialData={subCategory}
    />
  );
}
