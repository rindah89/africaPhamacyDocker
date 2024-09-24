"use client";

import { Card, CardContent } from "@/components/ui/card";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { UserProps } from "@/types/types";

import TextInput from "@/components/global/FormInputs/TextInput";

import toast from "react-hot-toast";
import ImageInput from "@/components/global/FormInputs/ImageInput";
import { createUser, updateUserById } from "@/actions/users";
import FormHeader from "../Forms/FormHeader";
import { Session } from "next-auth";
type UserFormProps = {
  session: Session | null;
};
export default function UpdateProfile({ session }: UserFormProps) {
  const user = session?.user;
  const editingId = user?.id;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserProps>({
    defaultValues: {
      firstName: user?.firstName,
      lastName: user?.lastName,
      phone: user?.phone,
      email: user?.email ?? "",
    },
  });
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const initialImage = user?.image || "/placeholder.svg";
  const [imageUrl, setImageUrl] = useState(initialImage);
  async function saveUser(data: UserProps) {
    try {
      setLoading(true);
      data.profileImage = imageUrl;
      data.name = `${data.firstName} ${data.lastName}`;
      console.log(data);
      if (editingId) {
        await updateUserById(editingId, data);
        setLoading(false);
        // Toast
        toast.success("Updated Successfully!");
        //reset
        reset();
        //route
        router.push("/dashboard/settings");
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }

  return (
    <form className="" onSubmit={handleSubmit(saveUser)}>
      <FormHeader
        href=""
        title="Profile"
        editingId={editingId}
        loading={loading}
        parent=""
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
        </div>
        <div className="lg:col-span-4 col-span-full ">
          <div className="grid auto-rows-max items-start gap-4 ">
            <ImageInput
              title="Profile Image"
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              endpoint="warehouseLogo"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
