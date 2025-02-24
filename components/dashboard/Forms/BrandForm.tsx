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
import { BrandProps, CategoryProps, SelectOption } from "@/types/types";

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
import { Brand } from "@prisma/client";
import { createBrand, updateBrandById } from "@/actions/brand";
import CloseButton from "../CloseButton";
import FormFooter from "./FormFooter";
type BrandFormProps = {
  editingId?: string | undefined;
  initialData?: Brand | undefined | null;
};
export default function BrandForm({ editingId, initialData }: BrandFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BrandProps>({
    defaultValues: {
      title: initialData?.title,
    },
  });
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const initialImage = initialData?.logo || "/placeholder.svg";
  const [logo, setLogo] = useState(initialImage);
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
  async function saveBrand(data: BrandProps) {
    try {
      setLoading(true);
      // console.log(data);
      data.slug = generateSlug(data.title);
      data.status = status && status.value == "true" ? true : false;
      data.logo = logo;

      if (editingId) {
        await updateBrandById(editingId, data);
        setLoading(false);
        // Toast
        toast.success("Updated Successfully!");
        //reset
        reset();
        //route
        router.push("/dashboard/inventory/brands");
      } else {
        await createBrand(data);
        setLoading(false);
        // Toast
        toast.success("Successfully Created!");
        //reset
        reset();
        //route
        // router.push("/dashboard/inventory/brands");
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }

  console.log(status);

  return (
    <form className="" onSubmit={handleSubmit(saveBrand)}>
      <FormHeader
        title="Brand"
        editingId={editingId}
        loading={loading}
        href="/brands"
      />
      <div className="grid grid-cols-12 gap-6 py-8">
        <div className="lg:col-span-8 col-span-full ">
          <Card>
            <CardHeader>
              <CardTitle>Brand Title</CardTitle>
              <CardDescription>
                Enter the brand title
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Brand Name"
                    name="title"
                  />
                </div>
                <div className="grid">
                  <Card>
                    <CardHeader>
                      <CardTitle>Brand Status</CardTitle>
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
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-4 col-span-full ">
          <div className="grid auto-rows-max items-start gap-4 ">
            <ImageInput
              title="Brand Logo"
              imageUrl={logo}
              setImageUrl={setLogo}
              endpoint="brandLogo"
            />
          </div>
        </div>
      </div>
      <FormFooter
        href="/brands"
        editingId={editingId}
        loading={loading}
        title="Brand"
      />
    </form>
  );
}
