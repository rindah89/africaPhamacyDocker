"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { createProductBatch, updateProductBatch } from "@/actions/productBatches";
import { ProductBatch, Product } from "@prisma/client";
import TextInput from "@/components/global/FormInputs/TextInput";
import TextArea from "@/components/global/FormInputs/TextArea";
import { useState } from "react";
import toast from "react-hot-toast";
import FormHeader from "./FormHeader";
import FormFooter from "./FormFooter";
import Select from "react-tailwindcss-select";
import FormSelectInput from "@/components/global/FormInputs/FormSelectInput";
import Link from "next/link";

interface BatchFormProps {
  productId?: string;
  batch?: ProductBatch;
  products: Product[];
}

export default function BatchForm({ productId, batch, products }: BatchFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const productOptions = products?.map((product: Product) => ({
    value: product.id,
    label: product.name,
  })) || [];

  const initialProductId = productId || batch?.productId;
  const initialProduct = productOptions.find(
    (item) => item.value === initialProductId
  );
  const [selectedProduct, setSelectedProduct] = useState<any>(initialProduct);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      batchNumber: batch?.batchNumber || "",
      quantity: batch?.quantity || 0,
      expiryDate: batch?.expiryDate ? new Date(batch.expiryDate).toISOString().split('T')[0] : "",
      manufactureDate: batch?.manufactureDate ? new Date(batch.manufactureDate).toISOString().split('T')[0] : "",
      costPerUnit: batch?.costPerUnit || 0,
      notes: batch?.notes || undefined,
      status: batch?.status ?? true,
    }
  });

  const onSubmit = async (data: any) => {
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }

    try {
      setLoading(true);
      const formData = {
        ...data,
        quantity: parseInt(data.quantity),
        costPerUnit: parseFloat(data.costPerUnit),
        productId: selectedProduct.value,
        expiryDate: new Date(data.expiryDate),
        manufactureDate: data.manufactureDate ? new Date(data.manufactureDate) : null,
        notes: data.notes || null,
      };

      if (batch) {
        await updateProductBatch(batch.id, formData);
        toast.success("Batch updated successfully");
      } else {
        await createProductBatch(formData);
        toast.success("Batch created successfully");
      }
      router.push("/dashboard/inventory/batches");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormHeader
        href="/dashboard/inventory/batches"
        title="Batch"
        editingId={batch?.id}
        loading={loading}
      />
      <div className="grid grid-cols-12 gap-6 py-8">
        <div className="lg:col-span-8 col-span-full space-y-4">
          <Card>
            <CardContent>
              <div className="grid gap-6 pt-3">
                {productOptions && productOptions.length > 0 ? (
                  <FormSelectInput
                    label="Product"
                    options={productOptions}
                    option={selectedProduct}
                    setOption={setSelectedProduct}
                    toolTipText="Add New Product"
                    href="/dashboard/inventory/products/new"
                  />
                ) : (
                  <div className="space-y-2">
                    <h2 className="font-medium text-sm">No Products Available</h2>
                    <Button asChild size={"sm"} variant={"outline"}>
                      <Link
                        className="text-blue-500 text-xs font-semibold"
                        href="/dashboard/inventory/products/new"
                      >
                        Create New Product
                      </Link>
                    </Button>
                  </div>
                )}
                <TextInput
                  register={register}
                  errors={errors}
                  label="Batch Number"
                  name="batchNumber"
                  required
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Quantity"
                  name="quantity"
                  type="number"
                  required
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Expiry Date"
                  name="expiryDate"
                  type="date"
                  required
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Manufacture Date"
                  name="manufactureDate"
                  type="date"
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Cost Per Unit"
                  name="costPerUnit"
                  type="number"
                  required
                />
                <TextArea
                  register={register}
                  errors={errors}
                  label="Notes (Optional)"
                  name="notes"
                />
                <div className="relative flex gap-x-3">
                  <div className="flex h-6 items-center">
                    <input
                      {...register("status")}
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                  </div>
                  <div className="text-sm leading-6">
                    <label htmlFor="status" className="font-medium text-gray-900">
                      Active Status
                    </label>
                    <p className="text-gray-500">
                      Mark this batch as active or inactive
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <FormFooter
        href="/dashboard/inventory/batches"
        editingId={batch?.id}
        loading={loading}
        title="Batch"
      />
    </form>
  );
} 