"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormHeader from "@/components/dashboard/Layout/FormHeader";
import FormFooter from "@/components/dashboard/Layout/FormFooter";
import Select from "react-select";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createInsuranceProvider, updateInsuranceProvider } from "@/actions/insurance";
import { InsuranceProvider } from "@prisma/client";

interface InsuranceProviderFormProps {
  editingId?: string;
  initialData?: InsuranceProvider | null;
}

// Define the validation schema
const providerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  contactPerson: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(5, "Phone number must be at least 5 characters"),
  address: z.string().optional(),
  city: z.string().optional(),
  coveragePercentage: z.coerce.number().min(1).max(100),
  status: z.boolean().optional(),
});

// Infer the type from schema
type ProviderFormData = z.infer<typeof providerSchema>;

export default function InsuranceProviderForm({
  editingId,
  initialData,
}: InsuranceProviderFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
    defaultValues: initialData || {
      name: "",
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      coveragePercentage: 80,
      status: true,
    },
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Status options for the select
  const options = [
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
  ];

  // Handle the status change
  const [status, setStatus] = useState<{ value: string; label: string } | null>(
    initialData
      ? initialData.status
        ? { value: "true", label: "Active" }
        : { value: "false", label: "Inactive" }
      : { value: "true", label: "Active" }
  );

  const handleChange = (selectedOption: any) => {
    setStatus(selectedOption);
  };

  async function saveProvider(data: ProviderFormData) {
    try {
      setLoading(true);
      // Set the status based on the select value
      data.status = status && status.value === "true";
      
      if (editingId) {
        await updateInsuranceProvider(editingId, data);
        setLoading(false);
        toast.success("Provider Updated Successfully!");
        reset();
        router.push("/dashboard/insurance/providers");
      } else {
        await createInsuranceProvider(data);
        setLoading(false);
        toast.success("Provider Created Successfully!");
        reset();
        // Stay on the page to allow adding more providers
      }
    } catch (error: any) {
      setLoading(false);
      console.error("Error saving provider:", error);
      toast.error(error.message || "Failed to save insurance provider");
    }
  }

  return (
    <form onSubmit={handleSubmit(saveProvider)}>
      <FormHeader
        href="/dashboard/insurance/providers"
        title="Insurance Provider"
        editingId={editingId}
        loading={loading}
      />
      <div className="grid grid-cols-12 gap-6 py-8">
        <div className="lg:col-span-8 col-span-full">
          <Card>
            <CardHeader>
              <CardTitle>Provider Information</CardTitle>
              <CardDescription>
                Enter the insurance provider's details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Provider Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter provider name"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="Enter company name"
                    {...register("companyName")}
                  />
                  {errors.companyName && (
                    <p className="text-xs text-red-500">{errors.companyName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    placeholder="Enter contact person"
                    {...register("contactPerson")}
                  />
                  {errors.contactPerson && (
                    <p className="text-xs text-red-500">{errors.contactPerson.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coveragePercentage">Coverage Percentage</Label>
                  <Input
                    id="coveragePercentage"
                    type="number"
                    placeholder="Enter coverage percentage"
                    {...register("coveragePercentage")}
                    min={1}
                    max={100}
                  />
                  {errors.coveragePercentage && (
                    <p className="text-xs text-red-500">{errors.coveragePercentage.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Enter city"
                    {...register("city")}
                  />
                  {errors.city && (
                    <p className="text-xs text-red-500">{errors.city.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter address"
                    {...register("address")}
                  />
                  {errors.address && (
                    <p className="text-xs text-red-500">{errors.address.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 col-span-full">
          <Card>
            <CardHeader>
              <CardTitle>Provider Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <Select
                  isSearchable
                  value={status}
                  onChange={handleChange}
                  options={options}
                  placeholder="Status"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <FormFooter
        href="/dashboard/insurance/providers"
        editingId={editingId}
        loading={loading}
        title="Provider"
      />
    </form>
  );
} 