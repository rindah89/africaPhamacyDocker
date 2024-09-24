"use client";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import TextInput from "../global/FormInputs/TextInput";
import SubmitButton from "../global/FormInputs/SubmitButton";

import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { sendPasswordResetToken } from "@/actions/emails";
export type ForgotPasswordProps = {
  email: string;
};
export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordProps>();
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  async function onSubmit(data: ForgotPasswordProps) {
    setLoading(true);
    try {
      console.log(data);
      const res = await sendPasswordResetToken(data.email);
      if (res.status === 404 || res.status === 429) {
        setLoading(false);
        setErr(res.error);
        return;
      } else if (res.status === 200) {
        setLoading(false);
        toast.success("Email sent successfully");
        console.log(res);
        router.push(`/verify-token?id=${res.data?.id}`);
      }
    } catch (error) {
      setLoading(false);
      console.error("Network Error:", error);
      // toast.error("Its seems something is wrong with your Network");
    }
  }
  return (
    <div className="w-full py-5 lg:px-8 px-6">
      <div className="">
        <div className="py-4">
          <h2 className=" text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100">
            Forgot your Password?
          </h2>
          <p className="text-xs">
            No Worries, We will send you reset instructions
          </p>
        </div>
      </div>
      <div className="">
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <TextInput
            register={register}
            errors={errors}
            label="Email Address"
            name="email"
            icon={Mail}
            placeholder="email"
          />
          {err && <p className="text-red-500 text-xs -mt-2">{err}</p>}

          <div>
            <SubmitButton
              title="Send"
              loadingTitle="Sending Please wait.."
              loading={loading}
              className="w-full"
              loaderIcon={Loader2}
              showIcon={false}
            />
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Remember Password ?{" "}
          <Link
            href="/login"
            className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
