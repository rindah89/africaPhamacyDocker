"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TextInput from "@/components/global/FormInputs/TextInput";
import TextArea from "@/components/global/FormInputs/TextArea";
import { useForm } from "react-hook-form";
import { ProductBatchProps } from "@/types/types";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState } from "react";
import FormHeader from "./FormHeader";
import FormFooter from "./FormFooter";
import { createProductBatch } from "@/actions/productBatches";
import FormSelectInput from "@/components/global/FormInputs/FormSelectInput";
import { Product } from "@prisma/client";

type BatchFormProps = {
  productId?: string;
  products: Product[];
  editingId?: string;
  initialData?: ProductBatchProps;
};

export default function BatchForm({ productId, products, editingId, initialData }: BatchFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const productOptions = products.map((product) => ({
    value: product.id,
    label: product.name,
  }));

  const initialProductOption = productId 
    ? productOptions.find(opt => opt.value === productId)
    : undefined;

  const [selectedProduct, setSelectedProduct] = useState(initialProductOption);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductBatchProps>({
    defaultValues: {
      batchNumber: initialData?.batchNumber || "",
      quantity: initialData?.quantity || 0,
      expiryDate: initialData?.expiryDate || "",
      manufactureDate: initialData?.manufactureDate || "",
      costPerUnit: initialData?.costPerUnit || 0,
      notes: initialData?.notes || "",
      status: initialData?.status || true,
      productId: productId || "",
    },
  });

  async function saveBatch(data: ProductBatchProps) {
    try {
      if (!selectedProduct) {
        toast.error("Please select a product");
        return;
      }

      setLoading(true);
      data.productId = selectedProduct.value;
      data.status = true;
      
      const res = await createProductBatch(data);
      if (res) {
        setLoading(false);
        toast.success("Batch Successfully Created!");
        reset();
        if (productId) {
          router.push(`/dashboard/inventory/products/${productId}`);
        } else {
          router.push("/dashboard/inventory/batches");
        }
      } else {
        toast.error("Something went wrong, Please try again");
      }
    } catch (error) {
      setLoading(false);
      toast.error("⚠️ Please Fill in all the Fields 🔥");
      console.log(error);
    }
  }

  return (
    <form onSubmit={handleSubmit(saveBatch)}>
      <FormHeader
        href={productId ? `/dashboard/inventory/products/${productId}` : "/dashboard/inventory/batches"}
        title="Product Batch"
        editingId={editingId}
        loading={loading}
      />
      <div className="grid grid-cols-12 gap-6 py-8">
        <div className="col-span-full space-y-4">
          <Card>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {!productId && (
                  <FormSelectInput
                    label="Product"
                    options={productOptions}
                    option={selectedProduct}
                    setOption={setSelectedProduct}
                    toolTipText="Add New Product"
                    href="/dashboard/inventory/products/new"
                  />
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
                  label="Notes"
                  name="notes"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <FormFooter
        href={productId ? `/dashboard/inventory/products/${productId}` : "/dashboard/inventory/batches"}
        editingId={editingId}
        loading={loading}
        title="Product Batch"
      />
    </form>
  );
} 