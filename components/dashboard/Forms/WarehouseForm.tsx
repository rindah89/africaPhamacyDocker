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
import { CategoryProps, SelectOption, WarehouseProps } from "@/types/types";

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
import { Warehouse } from "@prisma/client";
import { createWarehouse, updateWarehouseById } from "@/actions/warehouse";
import FormFooter from "./FormFooter";
type WarehouseFormProps = {
  editingId?: string | undefined;
  initialData?: Warehouse | undefined | null;
};
export default function WarehouseForm({
  editingId,
  initialData,
}: WarehouseFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WarehouseProps>({
    defaultValues: {
      name: initialData?.name,
      country: initialData?.country,
      city: initialData?.city,
      phone: initialData?.phone,
      email: initialData?.email,
      zipCode: initialData?.zipCode,
      contactPerson: initialData?.contactPerson,
    },
  });
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const initialImage = initialData?.logo || "/placeholder.svg";
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
    console.log("value:", item);
    setStatus(item);
  };
  async function saveWarehouse(data: WarehouseProps) {
    try {
      setLoading(true);
      console.log(data);
      data.slug = generateSlug(data.name);
      data.status = status && status.value == "true" ? true : false;
      data.logo = imageUrl;
      console.log(data);
      if (editingId) {
        await updateWarehouseById(editingId, data);
        setLoading(false);
        // Toast
        toast.success("Updated Successfully!");
        //reset
        reset();
        //route
        router.push("/dashboard/inventory/warehouse");
      } else {
        await createWarehouse(data);
        setLoading(false);
        // Toast
        toast.success("Successfully Created!");
        //reset
        reset();
        //route
        router.push("/dashboard/inventory/warehouse");
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }

  return (
    <form className="" onSubmit={handleSubmit(saveWarehouse)}>
      <FormHeader
        href="/warehouse"
        title="Warehouse"
        editingId={editingId}
        loading={loading}
      />
      <div className="grid grid-cols-12 gap-6 py-8">
        <div className="lg:col-span-8 col-span-full ">
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Name</CardTitle>
              <CardDescription>
                Lipsum dolor sit amet, consectetur adipiscing elit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Warehouse Name"
                    name="name"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Country"
                    name="country"
                  />
                  <TextInput
                    register={register}
                    errors={errors}
                    label="City"
                    name="city"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Phone"
                    name="phone"
                  />
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Email Address"
                    name="email"
                    type="email"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Contact Person"
                    name="contactPerson"
                  />
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Zip Code"
                    name="zipCode"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-4 col-span-full ">
          <div className="grid auto-rows-max items-start gap-4 ">
            <Card>
              <CardHeader>
                <CardTitle>Warehouse Status</CardTitle>
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
              title="Warehouse Logo"
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              endpoint="warehouseLogo"
            />
          </div>
        </div>
      </div>
      <FormFooter
        href="/warehouse"
        editingId={editingId}
        loading={loading}
        title="Warehouse"
      />
    </form>
  );
}
