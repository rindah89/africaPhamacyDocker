"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { UserProps } from "@/types/types";

import TextInput from "@/components/global/FormInputs/TextInput";
import PreviousButton from "./PreviousButton";
import NextButton from "./NextButton";
import {
  PersonalDetails,
  setPersonalDetails,
} from "@/redux/slices/checkoutSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import { setActiveStep } from "@/redux/slices/stepSlice";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";

export default function PersonalDetailsForm({ session }: { session: Session }) {
  const dispatch = useAppDispatch();
  const activeStep = useAppSelector((state) => state.step.activeStep);
  const personalDetails = useAppSelector(
    (state) => state.checkout.personalDetails
  );
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonalDetails>({
    defaultValues: {
      firstName: session?.user?.firstName,
      lastName: session?.user?.lastName,
      email: session?.user?.email as string,
      phone: session?.user?.phone,
    },
  });
  async function saveData(data: PersonalDetails) {
    dispatch(setActiveStep(activeStep + 1));
    dispatch(setPersonalDetails(data));
  }

  return (
    <form className="w-full" onSubmit={handleSubmit(saveData)}>
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
      <div className="py-4 flex items-center justify-between">
        <PreviousButton />
        <NextButton />
      </div>
    </form>
  );
}
