"use client";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyResetToken } from "@/actions/emails";
import { Button } from "../ui/button";
export default function VerifyAccountForm() {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [dbErr, setDBErr] = useState<string | null>("");
  console.log(code);
  const params = useSearchParams();
  const userId = params.get("id") ?? "";
  const router = useRouter();
  async function handleVerify() {
    setLoading(true);
    try {
      const res = await verifyResetToken(userId, Number(code));
      if (res.status === 403 || res.status === 404) {
        setDBErr(res.error);
        setLoading(false);
        return;
      }
      toast.success("Token Verified successfully");
      setLoading(false);
      router.push(`/change-password?id=${res.data.id}`);
      setCode("");
      console.log(userId);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }
  return (
    <div className="w-full py-5 lg:px-8 px-6">
      <div className="">
        <div className="py-4">
          <h2 className=" text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100">
            Enter the Code
          </h2>
          <p className="text-xs">
            We sent a one-time code to your email to Confirm
          </p>
        </div>
      </div>
      <div className="">
        <form className="space-y-3">
          <div>
            <div className="mt-2 relative">
              <InputOTP
                maxLength={6}
                className="w-full"
                value={code}
                onChange={(newValue) => setCode(newValue)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              {dbErr && <p className="text-red-500 text-xs mt-2">{dbErr}</p>}
            </div>
          </div>
          <div>
            {loading ? (
              <button
                disabled
                type="button"
                className="flex items-center w-full justify-center rounded-md bg-indigo-600/50 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing please wait ...
              </button>
            ) : (
              <button
                onClick={handleVerify}
                type="button"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Verify Email
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
