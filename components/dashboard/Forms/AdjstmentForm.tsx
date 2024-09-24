"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IProduct, AdjustmentProps } from "@/types/types";
import Select from "react-tailwindcss-select";
import { Loader2, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import TextArea from "@/components/global/FormInputs/TextArea";
import { createAdjustment } from "@/actions/adjustments";
import toast from "react-hot-toast";

interface AdjustmentItem {
  productId: string;
  quantity: number;
  type: "Addition" | "Subtraction";
  currentStock: number;
  productName: string;
}
export type AdjustmentDataProps = {
  reason: string;
  items: AdjustmentItem[];
};
export default function AdjustmentForm({ products }: { products: IProduct[] }) {
  const [items, setItems] = useState<AdjustmentItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const productOptions = products.map((item) => ({
    label: item.name,
    value: item.id,
  }));
  const router = useRouter();

  function handleChange(item: any) {
    const productId = item?.value;
    const productExists = items.some((item) => item.productId === productId);
    const product = products.find((item) => item.id === productId);
    if (!productExists) {
      setItems((prevItems) => [
        ...prevItems,
        {
          productId,
          quantity: 1,
          type: "Addition",
          currentStock: product!.stockQty,
          productName: product!.name,
        },
      ]);
    }
  }

  const handleQtyIncrement = (productId: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const handleQtyDecrement = (productId: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const handleTypeChange = (
    productId: string,
    type: "Addition" | "Subtraction"
  ) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId ? { ...item, type } : item
      )
    );
  };

  const handleQtyChange = (productId: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ reason: string }>();
  const [loading, setLoading] = useState(false);
  async function onSubmit(data: { reason: string }) {
    setLoading(true);
    try {
      const adjustmentData = {
        reason: data.reason, // You can update this as needed
        items,
      };
      await createAdjustment(adjustmentData);
      setLoading(false);
      toast.success("Adjustment Created Successfully");
      router.push("/dashboard/stock/adjustment");
    } catch (error) {
      setLoading(false);
      console.error("Error creating adjustment:", error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center w-full ">
          <div className="w-full">
            <h2 className="pb-2 block text-sm font-medium leading-6 ">
              Select Products
            </h2>
            <div className="flex items-center space-x-2">
              <Select
                isSearchable
                primaryColor="blue"
                value={selectedProduct}
                onChange={handleChange}
                options={productOptions}
                placeholder="Products"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">
                  Current Stock
                </TableHead>
                <TableHead className="hidden md:table-cell">Qty</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
              </TableRow>
            </TableHeader>
            <>
              {items && items.length > 0 ? (
                <TableBody className="">
                  {items.map((item) => {
                    const product = products.find(
                      (p) => p.id === item.productId
                    );
                    return (
                      <TableRow key={item.productId}>
                        <TableCell className="font-medium">
                          {product?.productCode}
                        </TableCell>
                        <TableCell className="font-medium">
                          {product?.name}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {product?.stockQty}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleQtyDecrement(item.productId)}
                              className="border shadow rounded flex items-center justify-center w-10 h-7"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              className="inline-block border-0 outline-0 w-16 text-slate-900 rounded"
                              onChange={(e) =>
                                handleQtyChange(item.productId, +e.target.value)
                              }
                            />
                            <button
                              onClick={() => handleQtyIncrement(item.productId)}
                              className="border shadow rounded flex items-center justify-center w-10 h-7 bg-slate-800 text-white"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="mt-2">
                            <select
                              id="type"
                              name="type"
                              value={item.type}
                              onChange={(e) =>
                                handleTypeChange(
                                  item.productId,
                                  e.target.value as "Addition" | "Subtraction"
                                )
                              }
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                            >
                              <option value="Addition">Addition</option>
                              <option value="Subtraction">Subtraction</option>
                            </select>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              ) : (
                <TableBody className="">
                  <h2>No Products</h2>
                </TableBody>
              )}
            </>
          </Table>
          <div className="py-6">
            <TextArea
              register={register}
              errors={errors}
              label="Reason"
              name="reason"
            />
          </div>
          {loading ? (
            <Button disabled>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span>Creating Please wait...</span>
            </Button>
          ) : (
            <Button onClick={handleSubmit(onSubmit)}>Create Adjustment</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
