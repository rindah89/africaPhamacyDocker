"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TextInput from "@/components/global/FormInputs/TextInput";
import TextArea from "@/components/global/FormInputs/TextArea";
import { useForm } from "react-hook-form";
import { Product, ProductBatch } from "@prisma/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState } from "react";
import FormHeader from "./FormHeader";
import FormFooter from "./FormFooter";
import { createProductBatch } from "@/actions/productBatches";
import FormSelectInput from "@/components/global/FormInputs/FormSelectInput";
import { Option } from "react-tailwindcss-select/dist/components/type";

type BatchFormProps = {
  productId?: string;
  products: Product[];
  editingId?: string;
  initialData?: ProductBatch;
  batch?: any;
};

type BatchFormData = Omit<ProductBatch, 'expiryDate' | 'deliveryDate' | 'id' | 'createdAt' | 'updatedAt'> & {
  expiryDate: string;
  deliveryDate?: string | null;
};

export default function BatchForm({ productId, products, editingId, initialData, batch }: BatchFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const productOptions = products.map((product) => ({
    value: product.id,
    label: product.name,
    price: product.productPrice
  }));

  const initialProductOption = productId 
    ? productOptions.find(opt => opt.value === productId)
    : undefined;

  const [selectedProduct, setSelectedProduct] = useState<Option | undefined>(initialProductOption);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BatchFormData>({
    defaultValues: {
      batchNumber: initialData?.batchNumber || "",
      quantity: initialData?.quantity || 0,
      expiryDate: initialData?.expiryDate ? new Date(initialData.expiryDate).toISOString().split('T')[0] : "",
      deliveryDate: initialData?.deliveryDate ? new Date(initialData.deliveryDate).toISOString().split('T')[0] : "",
      costPerUnit: initialData?.costPerUnit || 0,
      notes: initialData?.notes || "Batch received in good condition",
      status: initialData?.status || true,
      productId: productId || "",
    },
  });

  // Update costPerUnit when product is selected
  const handleProductSelect = (option: Option | undefined) => {
    setSelectedProduct(option);
    if (option) {
      const product = products.find(p => p.id === option.value);
      if (product) {
        setValue('costPerUnit', product.productPrice);
      }
    }
  };

  // If we have a productId but no initialData (new batch), set the cost to the product's price
  React.useEffect(() => {
    if (productId && !initialData) {
      const product = products.find(p => p.id === productId);
      if (product) {
        setValue('costPerUnit', product.productPrice);
      }
    }
  }, [productId, products, setValue, initialData]);

  async function saveBatch(data: BatchFormData) {
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
                    setOption={handleProductSelect}
                    toolTipText="Add New Product"
                    href="/dashboard/inventory/products/new"
                  />
                )}
                <TextInput
                  register={register}
                  errors={errors}
                  label="Batch Number"
                  name="batchNumber"
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Quantity"
                  name="quantity"
                  type="number"
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Expiry Date"
                  name="expiryDate"
                  type="date"
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Delivery Date"
                  name="deliveryDate"
                  type="date"
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Cost Per Unit"
                  name="costPerUnit"
                  type="number"
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