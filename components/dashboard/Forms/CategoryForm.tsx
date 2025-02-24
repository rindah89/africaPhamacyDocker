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
import { CategoryProps, SelectOption } from "@/types/types";

import TextInput from "@/components/global/FormInputs/TextInput";
import TextArea from "@/components/global/FormInputs/TextArea";

import { generateSlug } from "@/lib/generateSlug";
import {
  createCategory,
  deleteManyCategories,
  updateCategoryById,
} from "@/actions/category";
import toast from "react-hot-toast";
import SubmitButton from "@/components/global/FormInputs/SubmitButton";
import ImageInput from "@/components/global/FormInputs/ImageInput";
import {
  Options,
  SelectValue,
} from "react-tailwindcss-select/dist/components/type";
import { Category } from "@prisma/client";
import FormFooter from "./FormFooter";
import FormSelectInput from "@/components/global/FormInputs/FormSelectInput";

export type SelectOptionProps = {
  label: string;
  value: string;
};
type CategoryFormProps = {
  editingId?: string | undefined;
  initialData?: Category | undefined | null;
  mainCategories: SelectOptionProps[];
};
export default function CategoryForm({
  editingId,
  initialData,
  mainCategories,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryProps>({
    defaultValues: {
      title: initialData?.title,
      description: initialData?.description || "",
    },
  });
  const router = useRouter();
  const initialMainCategoryId = initialData?.mainCategoryId;
  const initialCategory = mainCategories.find(
    (item) => item.value === initialMainCategoryId
  );
  const [selectedMainCategory, setSelectedMainCategory] =
    useState<any>(initialCategory);
  const [loading, setLoading] = useState(false);
  const initialImage = initialData?.imageUrl || "/placeholder.svg";
  const [imageUrl, setImageUrl] = useState(initialImage);
  const initialStatus = {
    value: initialData?.status == true ? "true" : "false",
    label: initialData?.status == true ? "Active" : "Disabled",
  };
  const [status, setStatus] = useState<any>(initialStatus);
  const options: Options = [
    { value: "true", label: "Active" },
    { value: "false", label: "Disabled" },
  ];
  const handleChange = (item: SelectValue) => {
    // console.log("value:", item);
    setStatus(item);
  };
  async function saveCategory(data: CategoryProps) {
    try {
      setLoading(true);
      data.slug = generateSlug(data.title);
      data.status = status && status.value == "true" ? true : false;
      data.imageUrl = imageUrl;
      data.mainCategoryId = selectedMainCategory.value;

      if (editingId) {
        await updateCategoryById(editingId, data);
        setLoading(false);
        // Toast
        toast.success("Updated Successfully!");
        //reset
        reset();
        //route
        router.push("/dashboard/inventory/categories");
        setImageUrl("/placeholder.svg");
      } else {
        await createCategory(data);
        setLoading(false);
        // Toast
        toast.success("Successfully Created!");
        //reset
        reset();
        setImageUrl("/placeholder.svg");
        //route
        // router.push("/dashboard/inventory/categories");
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }
  // async function handleDeleteAll() {
  //   setLoading(true);
  //   try {
  //     await deleteManyCategories();
  //     setLoading(false);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
  console.log(status);

  return (
    <form className="" onSubmit={handleSubmit(saveCategory)}>
      <FormHeader
        href="/categories"
        title="Category"
        editingId={editingId}
        loading={loading}
      />

      <div className="grid grid-cols-12 gap-6 py-8">
        <div className="lg:col-span-8 col-span-full space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Category Title</CardTitle>
              <CardDescription>
                 Enter the category title
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Category Title"
                    name="title"
                  />
                </div>
                <div className="grid gap-3">
                  <TextArea
                    register={register}
                    errors={errors}
                    label="Description"
                    name="description"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                <FormSelectInput
                  label="Main Categories"
                  options={mainCategories}
                  option={selectedMainCategory}
                  setOption={setSelectedMainCategory}
                  toolTipText="Add New Main Category"
                  href="/dashboard/inventory/main-categories/new"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-4 col-span-full ">
          <div className="grid auto-rows-max items-start gap-4 ">
            <Card>
              <CardHeader>
                <CardTitle>Category Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <Select
                    isSearchable
                    primaryColor="blue"
                    value={status}
                    onChange={handleChange}
                    options={options}
                    placeholder="Status"
                  />
                </div>
              </CardContent>
            </Card>
            <ImageInput
              title="Category Image"
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              endpoint="categoryImage"
            />
          </div>
        </div>
      </div>
      <FormFooter
        href="/categories"
        editingId={editingId}
        loading={loading}
        title="Category"
      />
    </form>
  );
}
