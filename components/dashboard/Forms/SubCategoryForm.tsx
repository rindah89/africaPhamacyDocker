"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import FormHeader from "./FormHeader";
import { useRouter } from "next/navigation";
import Select from "react-tailwindcss-select";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { CategoryProps, SelectOption, SubCategoryProps } from "@/types/types";

import TextInput from "@/components/global/FormInputs/TextInput";
import TextArea from "@/components/global/FormInputs/TextArea";

import { generateSlug } from "@/lib/generateSlug";
import { createCategory, updateCategoryById } from "@/actions/category";
import toast from "react-hot-toast";
import SubmitButton from "@/components/global/FormInputs/SubmitButton";
import ImageInput from "@/components/global/FormInputs/ImageInput";
import {
  Options,
  SelectValue,
} from "react-tailwindcss-select/dist/components/type";
import { Category, SubCategory } from "@prisma/client";
import FormFooter from "./FormFooter";
import { SelectOptionProps } from "./CategoryForm";
import FormSelectInput from "@/components/global/FormInputs/FormSelectInput";
import {
  createSubCategory,
  updateSubCategoryById,
} from "@/actions/sub-category";
type CategoryFormProps = {
  editingId?: string | undefined;
  initialData?: SubCategory | undefined | null;
  categories: SelectOptionProps[];
};
export default function SubCategoryForm({
  editingId,
  initialData,
  categories,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubCategoryProps>({
    defaultValues: {
      title: initialData?.title,
    },
  });
  const router = useRouter();
  const initialCategoryId = initialData?.categoryId;
  const initialCategory = categories.find(
    (item) => item.value === initialCategoryId
  );
  const [selectedCategory, setSelectedCategory] =
    useState<any>(initialCategory);
  const [loading, setLoading] = useState(false);
  async function saveCategory(data: SubCategoryProps) {
    try {
      setLoading(true);
      console.log(data);
      data.slug = generateSlug(data.title);
      data.categoryId = selectedCategory.value;
      if (editingId) {
        await updateSubCategoryById(editingId, data);
        setLoading(false);
        // Toast
        toast.success("Updated Successfully!");
        //reset
        reset();
        //route
        router.push("/dashboard/inventory/sub-categories");
      } else {
        await createSubCategory(data);
        setLoading(false);
        // Toast
        toast.success("Successfully Created!");
        //reset
        reset();
        //route
        // router.push("/dashboard/inventory/categories");
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }

  console.log(status);

  return (
    <form className="" onSubmit={handleSubmit(saveCategory)}>
      <FormHeader
        href="/sub-categories"
        title="Sub Category"
        editingId={editingId}
        loading={loading}
      />
      <div className="grid grid-cols-12 gap-6 py-8">
        <div className="lg:col-span-8 col-span-full ">
          <Card>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3 pt-4">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Category Title"
                    name="title"
                  />
                </div>
                <FormSelectInput
                  label="Categories"
                  options={categories}
                  option={selectedCategory}
                  setOption={setSelectedCategory}
                  toolTipText="Add New Category"
                  href="/dashboard/inventory/categories/new"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
