"use client";
import { Card, CardContent } from "@/components/ui/card";

import FormHeader from "./FormHeader";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { MainCategoryProps } from "@/types/types";

import TextInput from "@/components/global/FormInputs/TextInput";

import { generateSlug } from "@/lib/generateSlug";
import { createCategory, updateCategoryById } from "@/actions/category";
import toast from "react-hot-toast";

import { MainCategory } from "@prisma/client";
import {
  createMainCategory,
  updateMainCategoryById,
} from "@/actions/main-category";
type CategoryFormProps = {
  editingId?: string | undefined;
  initialData?: MainCategory | undefined | null;
};
export default function MainCategoryForm({
  editingId,
  initialData,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MainCategoryProps>({
    defaultValues: {
      title: initialData?.title,
    },
  });
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  async function saveCategory(data: MainCategoryProps) {
    try {
      setLoading(true);
      data.slug = generateSlug(data.title);
      if (editingId) {
        await updateMainCategoryById(editingId, data);
        setLoading(false);
        // Toast
        toast.success("Updated Successfully!");
        //reset
        reset();
        //route
        router.push("/dashboard/inventory/main-categories");
      } else {
        await createMainCategory(data);
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
        href="/main-categories"
        title="Main Category"
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
