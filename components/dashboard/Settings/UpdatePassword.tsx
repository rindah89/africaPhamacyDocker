"use client";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import PasswordInput from "@/components/global/FormInputs/PasswordInput";
import SubmitButton from "@/components/global/FormInputs/SubmitButton";
import { useRouter, useSearchParams } from "next/navigation";
import { updateUserPassword } from "@/actions/users";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { signOut, useSession } from "next-auth/react";

type NewPasswordProps = {
  password: string;
  cPassword: string;
};
export default function UpdatePassword() {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const userId = session?.user.id ?? "";
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<NewPasswordProps>();
  const router = useRouter();
  const [passErr, setPassErr] = useState<string | null>("");
  async function onSubmit(data: NewPasswordProps) {
    setLoading(true);
    // const password =data.password
    // const cPassword =data.cPassword
    if (data.password !== data.cPassword) {
      setPassErr("Password did not Match");
      setLoading(false);
      return;
    }
    try {
      if (userId) {
        const res = await updateUserPassword(userId, data.password);
        if (res.status === 404) {
          setPassErr(res.error);
          setLoading(false);
          return;
        }
        setLoading(false);
        toast.success("Password Changed successfully");
        reset();
        await signOut();
        router.push("/login");
      }
    } catch (error) {
      setLoading(false);
      console.error("Network Error:", error);
      toast.error("Its seems something is wrong, try again");
    }
  }
  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardContent>
          <div className="w-full py-5 lg:px-8 px-6">
            <div className="">
              <div className="py-4">
                <h2 className=" text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100">
                  Update Password
                </h2>
                <p className="text-xs">Fill in details to Change</p>
              </div>
            </div>
            <div className="">
              <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
                <PasswordInput
                  register={register}
                  errors={errors}
                  label="New Password"
                  name="password"
                  icon={Lock}
                  placeholder="password"
                  type="password"
                />
                <PasswordInput
                  register={register}
                  errors={errors}
                  label="Confirm Password"
                  name="cPassword"
                  icon={Lock}
                  placeholder="confirm password"
                  type="password"
                />
                {passErr && <p className="text-red-500 text-xs">{passErr}</p>}
                <div className="py-4">
                  <SubmitButton
                    title="Update Password"
                    loadingTitle="Updating Please wait.."
                    loading={loading}
                    className="w-full"
                    loaderIcon={Loader2}
                    showIcon={false}
                  />
                </div>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
