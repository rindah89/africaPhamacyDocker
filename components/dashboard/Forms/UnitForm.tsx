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
  BrandProps,
  CategoryProps,
  SelectOption,
  UnitProps,
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
import { Brand, Unit } from "@prisma/client";
import { createBrand, updateBrandById } from "@/actions/brand";
import { createUnit, updateUnitById } from "@/actions/unit";
type UnitFormProps = {
  editingId?: string | undefined;
  initialData?: Unit | undefined | null;
};
export default function UnitForm({ editingId, initialData }: UnitFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UnitProps>({
    defaultValues: {
      title: initialData?.title,
      abbreviation: initialData?.abbreviation,
    },
  });
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function saveUnit(data: UnitProps) {
    try {
      setLoading(true);
      console.log(data);
      if (editingId) {
        await updateUnitById(editingId, data);
        setLoading(false);
        // Toast
        toast.success("Updated Successfully!");
        //reset
        reset();
        //route
        router.push("/dashboard/inventory/units");
      } else {
        await createUnit(data);
        setLoading(false);
        // Toast
        toast.success("Successfully Created!");
        //reset
        reset();
        //route
        router.push("/dashboard/inventory/units");
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }

  console.log(status);

  return (
    <form className="" onSubmit={handleSubmit(saveUnit)}>
      <FormHeader
        href="/units"
        title="Unit"
        editingId={editingId}
        loading={loading}
      />
      <div className="grid grid-cols-12 gap-6 py-8">
        <div className="lg:col-span-8 col-span-full ">
          <Card>
            <CardContent>
              <div className="grid  gap-6">
                <div className="grid gap-3 pt-4 grid-cols-1 md:grid-cols-2">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Unit Name"
                    name="title"
                  />
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Unit Abbreviation"
                    name="abbreviation"
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
