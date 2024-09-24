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
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import { setActiveStep } from "@/redux/slices/stepSlice";
import {
  ShippingAddress,
  setShippingAddress,
} from "@/redux/slices/checkoutSlice";

export default function ShippingAddressForm() {
  const shippingAddress = useAppSelector(
    (state) => state.checkout.shippingAddress
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShippingAddress>({
    defaultValues: {
      apartment: shippingAddress.apartment,
      city: shippingAddress.city,
      state: shippingAddress.state,
      zipCode: shippingAddress.zipCode,
      country: shippingAddress.country,
      streetAddress: shippingAddress.streetAddress,
    },
  });
  const activeStep = useAppSelector((state) => state.step.activeStep);
  const dispatch = useAppDispatch();
  async function saveData(data: ShippingAddress) {
    dispatch(setActiveStep(activeStep + 1));
    dispatch(setShippingAddress(data));
  }

  return (
    <form className="w-full" onSubmit={handleSubmit(saveData)}>
      <div className="grid gap-3">
        <div className="grid pt-4 grid-cols-1 md:grid-cols-2 gap-3">
          <TextInput
            register={register}
            errors={errors}
            label="Street Address"
            name="streetAddress"
          />
          <TextInput
            register={register}
            errors={errors}
            label="Apartment or Unit No."
            name="apartment"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TextInput
            register={register}
            errors={errors}
            label="City"
            name="city"
          />
          <TextInput
            register={register}
            errors={errors}
            label="State"
            name="state"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TextInput
            register={register}
            errors={errors}
            label="Zip Code"
            name="zipCode"
          />
          <TextInput
            register={register}
            errors={errors}
            label="Country"
            name="country"
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
