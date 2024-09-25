"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
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
    control,
    reset,
    formState: { errors },
  } = useForm<ShippingAddress>({
    defaultValues: {
      apartment: shippingAddress.apartment,
      city: shippingAddress.city,
      state: shippingAddress.state || "Douala", // Set Douala as default if no state is selected
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

  const cameroonianTowns = [
    "Douala",
    "Yaoundé",
    "Bamenda",
    "Bafoussam",
    "Garoua",
    "Maroua",
    "Ngaoundéré",
    "Bertoua",
    "Loum",
    "Kumba",
    "Edéa",
    "Kumbo",
    "Foumban",
    "Mbouda",
    "Dschang",
    "Limbé",
    "Ebolowa",
    "Kousséri",
    "Guider",
    "Meiganga",
  ];

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
            label="Apartment or Office No."
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
          <Controller
            name="state"
            control={control}
            rules={{ required: "State is required" }}
            render={({ field }) => (
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  Town
                </label>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a town" />
                  </SelectTrigger>
                  <SelectContent>
                    {cameroonianTowns.map((town) => (
                      <SelectItem key={town} value={town}>
                        {town}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                )}
              </div>
            )}
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