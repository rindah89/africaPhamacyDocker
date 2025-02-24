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
import {
  AdvertProps,
  BannerProps,
  CategoryProps,
  SelectOption,
} from "@/types/types";

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
import { Advert, AdvertSize, Banner, Category } from "@prisma/client";
import FormFooter from "./FormFooter";
import FormSelectInput from "@/components/global/FormInputs/FormSelectInput";
import { createAdvert, updateAdvertById } from "@/actions/advert";
import { createBanner, updateBannerById } from "@/actions/banner";
import RadioInput from "@/components/global/FormInputs/RadioInput";

export type SelectOptionProps = {
  label: string;
  value: string;
};
type AdvertFormProps = {
  editingId?: string | undefined;
  initialData?: Advert | undefined | null;
};
export default function AdvertForm({
  editingId,
  initialData,
}: AdvertFormProps) {
  const radioOptions = [
    {
      label: "Full",
      id: "FULL",
    },
    {
      label: "Half",
      id: "HALF",
    },
    {
      label: "Quarter",
      id: "QUARTER",
    },
  ];
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdvertProps>({
    defaultValues: {
      title: initialData?.title,
      link: initialData?.link || "",
      size: initialData?.size || (radioOptions[0].id as AdvertSize),
    },
  });
  const router = useRouter();

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
  async function saveAdvert(data: AdvertProps) {
    try {
      setLoading(true);
      data.status = status && status.value == "true" ? true : false;
      data.imageUrl = imageUrl;
      // console.log(data);
      if (editingId) {
        await updateAdvertById(editingId, data);
        setLoading(false);
        // Toast
        toast.success("Updated Successfully!");
        //reset
        reset();
        //route
        router.push("/dashboard/inventory/adverts");
        setImageUrl("/placeholder.svg");
      } else {
        await createAdvert(data);
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

  return (
    <form className="" onSubmit={handleSubmit(saveAdvert)}>
      <FormHeader
        href="/adverts"
        title="Advert"
        editingId={editingId}
        loading={loading}
      />

      <div className="grid grid-cols-12 gap-6 py-8">
        <div className="lg:col-span-8 col-span-full space-y-3">
          <Card>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3 pt-4">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Advert Title"
                    name="title"
                  />
                </div>
                <div className="grid gap-3">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Advert Link"
                    name="link"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="grid gap-6">
                <RadioInput
                  radioOptions={radioOptions}
                  label="Advert Size"
                  register={register}
                  name="size"
                  errors={errors}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-4 col-span-full ">
          <div className="grid auto-rows-max items-start gap-4 ">
            <Card>
              <CardHeader>
                <CardTitle>Advert Status</CardTitle>
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
              title="Advert Image"
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              endpoint="advertImage"
            />
          </div>
        </div>
      </div>
      <FormFooter
        href="/adverts"
        editingId={editingId}
        loading={loading}
        title="Advert"
      />
    </form>
  );
}
