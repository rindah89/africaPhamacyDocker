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
  CategoryProps,
  SelectOption,
  SupplierProps,
  WarehouseProps,
} from "@/types/types";

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
import { Supplier, Warehouse } from "@prisma/client";
import { createWarehouse, updateWarehouseById } from "@/actions/warehouse";
import { createSupplier, updateSupplierById } from "@/actions/supplier";
import FormFooter from "./FormFooter";
type SupplierFormProps = {
  editingId?: string | undefined;
  initialData?: Supplier | undefined | null;
};
export default function SupplierForm({
  editingId,
  initialData,
}: SupplierFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierProps>({
    defaultValues: {
      name: initialData?.name,
      companyName: initialData?.companyName,
      vatNumber: initialData?.vatNumber,
      phone: initialData?.phone,
      email: initialData?.email,
      address: initialData?.address,
      city: initialData?.city,
      state: initialData?.state,
      postalCode: initialData?.postalCode,
      country: initialData?.country,
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
    console.log("value:", item);
    setStatus(item);
  };
  async function saveSupplier(data: SupplierProps) {
    try {
      setLoading(true);
      console.log(data);
      data.status = status && status.value == "true" ? true : false;
      data.imageUrl = imageUrl;
      console.log(data);
      if (editingId) {
        await updateSupplierById(editingId, data);
        setLoading(false);
        // Toast
        toast.success("Updated Successfully!");
        //reset
        reset();
        //route
        router.push("/dashboard/inventory/suppliers");
      } else {
        await createSupplier(data);
        setLoading(false);
        // Toast
        toast.success("Successfully Created!");
        //reset
        reset();
        //route
        // router.push("/dashboard/inventory/suppliers");
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }
  // name: string;
  // imageUrl: string;
  // companyName: string;
  // vatNumber: string;
  // email: string;
  // phone: string;
  // address: string;
  // city: string;
  // state: string;
  // postalCode: string;
  // country: string;
  // status: string;
  return (
    <form className="" onSubmit={handleSubmit(saveSupplier)}>
      <FormHeader
        href="/suppliers"
        title="Supplier"
        editingId={editingId}
        loading={loading}
      />
      <div className="grid grid-cols-12 gap-6 py-8">
        <div className="lg:col-span-8 col-span-full ">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Name</CardTitle>
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
                    label="Supplier Name"
                    name="name"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="VAT Number"
                    name="vatNumber"
                  />
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Company Name"
                    name="companyName"
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
                    label="Address"
                    name="address"
                  />
                  <TextInput
                    register={register}
                    errors={errors}
                    label="State"
                    name="state"
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
                <CardTitle>Supplier Status</CardTitle>
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
              title="Supplier Image"
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              endpoint="supplierImage"
            />
            <Card>
              <CardContent>
                <div className="grid gap-3">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Postal Code"
                    name="postalCode"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <FormFooter
        href="/suppliers"
        editingId={editingId}
        loading={loading}
        title="Supplier"
      />
    </form>
  );
}
