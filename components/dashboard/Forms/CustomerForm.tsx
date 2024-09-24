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
  ICustomer,
  SelectOption,
  UserProps,
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
import { Customer, Role, User, Warehouse } from "@prisma/client";
import { createWarehouse, updateWarehouseById } from "@/actions/warehouse";
import FormFooter from "./FormFooter";
import FormSelectInput from "@/components/global/FormInputs/FormSelectInput";
import { createUser, updateUserById } from "@/actions/users";
import { Lock } from "lucide-react";
import PasswordInput from "@/components/global/FormInputs/PasswordInput";
import {
  CustomerDataProps,
  createCustomer,
  updateCustomerById,
} from "@/actions/customer";
type UserFormProps = {
  editingId?: string | undefined;
  initialData?: ICustomer | undefined | null;
  roles: Role[];
};
export default function CustomerForm({
  editingId,
  initialData,
  roles,
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerDataProps>({
    defaultValues: {
      firstName: initialData?.user.firstName,
      lastName: initialData?.user.lastName,
      phone: initialData?.user.phone,
      email: initialData?.user.email,
      shippingAddress: initialData?.shippingAddress,
      billingAddress: initialData?.billingAddress,
      additionalInfo: initialData?.additionalInfo ?? "",
    },
  });
  // billingAddress: string;
  // shippingAddress: string;
  // additionalInfo?: string;

  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const initialImage = initialData?.user?.profileImage || "/placeholder.svg";
  const [imageUrl, setImageUrl] = useState(initialImage);
  const initialStatus = {
    value: initialData?.user?.status == true ? "true" : "false",
    label: initialData?.user?.status == true ? "Active" : "Disabled",
  };
  const initialRoleId = initialData?.user?.roleId;
  const initialRole = roles.find((item) => item.id === initialRoleId);
  const roleOptions = roles.map((role) => {
    return {
      label: role.displayName,
      value: role.id,
    };
  });
  const [role, setRole] = useState<any>({
    label: initialRole?.displayName,
    value: initialRole?.id,
  });
  const [status, setStatus] = useState<any>(initialStatus);
  const options: Options = [
    { value: "true", label: "Active" },
    { value: "false", label: "Disabled" },
  ];
  const handleChange = (item: SelectValue) => {
    // console.log("value:", item);
    setStatus(item);
  };
  async function saveCustomer(data: CustomerDataProps) {
    try {
      setLoading(true);
      data.status = status && status.value == "true" ? true : false;
      data.profileImage = imageUrl;
      data.roleId = role.value;
      console.log(data);
      if (editingId) {
        await updateCustomerById(editingId, initialData!.user.id, data);
        setLoading(false);
        // Toast
        toast.success("Updated Successfully!");
        //reset
        reset();
        //route
        router.push("/dashboard/sales/customers");
      } else {
        await createCustomer(data);
        setLoading(false);
        // Toast
        toast.success("Successfully Created!");
        //reset
        reset();
        router.push("/dashboard/sales/customers");
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }

  return (
    <form className="" onSubmit={handleSubmit(saveCustomer)}>
      <FormHeader
        href="/customers"
        title="Customer"
        editingId={editingId}
        loading={loading}
        parent="sales"
      />
      <div className="grid grid-cols-12 gap-6 py-8">
        <div className="lg:col-span-8 col-span-full space-y-6">
          <Card>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid pt-4 grid-cols-1 md:grid-cols-2 gap-3">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="First Name"
                    name="firstName"
                  />
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Last Name"
                    name="lastName"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Email Address"
                    name="email"
                  />
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Phone Number"
                    name="phone"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                {!editingId && (
                  <PasswordInput
                    register={register}
                    errors={errors}
                    label="Password"
                    name="password"
                    icon={Lock}
                    placeholder="password"
                  />
                )}
                <FormSelectInput
                  label="Roles"
                  options={roleOptions}
                  option={role}
                  setOption={setRole}
                  href="/dashboard/users/roles/new"
                  toolTipText="Create new Role"
                />
              </div>
              <div className="grid gap-3 pt-3">
                <TextArea
                  register={register}
                  errors={errors}
                  label="Additional Info"
                  name="additionalInfo"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-4 col-span-full ">
          <div className="grid auto-rows-max items-start gap-4 ">
            <Card>
              <CardHeader>
                <CardTitle>User Status</CardTitle>
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
              title="Profile Image"
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              endpoint="warehouseLogo"
            />
          </div>
        </div>
        <div className="col-span-full lg:col-span-6 gap-3 ">
          <Card>
            <CardContent>
              <div className="pt-3">
                <TextArea
                  register={register}
                  errors={errors}
                  label="Shipping Address"
                  name="shippingAddress"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-full lg:col-span-6 gap-3 ">
          <Card>
            <CardContent>
              <div className="pt-3">
                <TextArea
                  register={register}
                  errors={errors}
                  label="Billing Address"
                  name="billingAddress"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <FormFooter
        href="/customers"
        editingId={editingId}
        loading={loading}
        title="Customer"
        parent="sales"
      />
    </form>
  );
}
