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
import {
  IProduct,
  AdjustmentProps,
  PurchaseItem,
  IPurchaseOrder,
} from "@/types/types";
import Select from "react-tailwindcss-select";
import { Loader2, Minus, Plus, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import TextArea from "@/components/global/FormInputs/TextArea";
import { createAdjustment } from "@/actions/adjustments";
import toast from "react-hot-toast";
import { PurchaseOrderStatus, Supplier } from "@prisma/client";
import Link from "next/link";
import TextInput from "@/components/global/FormInputs/TextInput";
import { PurchaseOrderProps } from "../../../types/types";
import { createPurchase, updatePurchaseOrderById } from "@/actions/purchases";

export type PurchaseFormProps = {
  initialData?: IPurchaseOrder | null;
  editingId?: string;
  products: IProduct[];
  suppliers: Supplier[];
};
export default function PurchaseForm({
  products,
  suppliers,
  initialData,
  editingId,
}: PurchaseFormProps) {
  const supplierOptions = suppliers.map((item) => ({
    label: item.name,
    value: item.id,
  }));
  const initialItems =
    initialData?.items.map((item) => {
      return {
        productId: item.productId,
        quantity: item.quantity,
        currentStock: item.currentStock,
        productName: item.productName,
        productCost: item.unitCost,
        subTotal: item.subTotal,
      };
    }) || [];
  const [items, setItems] = useState<PurchaseItem[]>(initialItems);

  const totalPrice = items.reduce(
    (acc, item) => acc + item.productCost * item.quantity,
    0
  );
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const initialSupplier = editingId
    ? supplierOptions.find((item) => item.value === initialData?.supplierId)
    : supplierOptions[0];
  const [selectedSupplier, setSelectedSupplier] =
    useState<any>(initialSupplier);
  const initialSupplierProducts = products.filter((item) => {
    const initialSupplierId = editingId
      ? initialData?.supplierId
      : supplierOptions[0].value;
    return item.supplierId === initialSupplierId;
  });
  const [supplierProducts, setSupplierProducts] = useState<IProduct[]>(
    initialSupplierProducts
  );
  const productOptions =
    supplierProducts.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  const router = useRouter();

  function handleChange(item: any) {
    const productId = item?.value;
    const existingItem = items.find((item) => item.productId === productId);
    const product = products.find((item) => item.id === productId);
    if (!existingItem) {
      setItems((prevItems) => [
        ...prevItems,
        {
          productId,
          quantity: 1,
          currentStock: product!.stockQty,
          productName: product!.name,
          productCost: product!.supplierPrice,
          subTotal: product!.supplierPrice,
        },
      ]);
    }
  }
  function handleSupplierChange(item: any) {
    const supplierId = item?.value;
    setSelectedSupplier(item);
    // Filter Prodducts by Supplier Id
    const filteredProducts = products.filter(
      (item) => item.supplierId === supplierId
    );

    // Set the products in state
    setSupplierProducts(filteredProducts);
    setItems([]);
    console.log(item);
  }

  const handleQtyIncrement = (productId: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: item.quantity + 1,
              subTotal: (item.quantity + 1) * item.productCost,
            }
          : item
      )
    );
  };

  const handleQtyDecrement = (productId: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId && item.quantity > 1
          ? {
              ...item,
              quantity: item.quantity - 1,
              subTotal: (item.quantity - 1) * item.productCost,
            }
          : item
      )
    );
  };

  const handleQtyChange = (productId: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity, subTotal: quantity * item.productCost }
          : item
      )
    );
  };
  function deleteItem(id: string) {
    const filteredItems = items.filter((item) => item.productId !== id);
    setItems(filteredItems);
  }
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PurchaseOrderProps>({
    defaultValues: {
      balanceAmount: initialData?.balanceAmount || 0,
      discount: initialData?.discount || 0,
      tax: initialData?.tax || 0,
      shippingCost: initialData?.shippingCost || 0,
      notes: initialData?.notes || "",
    },
  });
  const [loading, setLoading] = useState(false);
  async function onSubmit(data: PurchaseOrderProps) {
    setLoading(true);
    try {
      const purchaseData = {
        notes: data.notes, // You can update this as needed
        items,
        discount: Number(data.discount),
        tax: Number(data.tax),
        shippingCost: Number(data.shippingCost),
        totalAmount: totalPrice,
        balanceAmount: Number(data.balanceAmount),
        status:
          Number(data.balanceAmount) === 0
            ? "PAID"
            : Number(data.balanceAmount) === totalPrice
            ? "UNPAID"
            : ("PARTIAL" as PurchaseOrderStatus),
        supplierId: selectedSupplier.value as string,
      };
      if (editingId) {
        await updatePurchaseOrderById(editingId, purchaseData);
        setLoading(false);
        toast.success("Purchase Order Updated Successfully");
        router.push("/dashboard/stock/purchase");
      } else {
        await createPurchase(purchaseData);
        setLoading(false);
        toast.success("Purchase Order Created Successfully");
        router.push("/dashboard/stock/purchase");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error creating adjustment:", error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center w-full ">
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="">
              <h2 className="pb-2 block text-sm font-medium leading-6 ">
                Select Supplier
              </h2>
              <div className="flex items-center space-x-2">
                <Select
                  isSearchable
                  primaryColor="blue"
                  value={selectedSupplier}
                  onChange={handleSupplierChange}
                  options={supplierOptions}
                  placeholder="Suppliers"
                />
              </div>
            </div>
            {productOptions && productOptions.length > 0 ? (
              <div className="">
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
            ) : (
              <div className=" space-y-2">
                <h2 className="font-medium text-sm">
                  Supplier has No Products Yet
                </h2>
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
                <TableHead className="hidden md:table-cell">
                  Unit Cost
                </TableHead>
                <TableHead className="hidden md:table-cell">Qty</TableHead>
                <TableHead className="hidden md:table-cell">Actions</TableHead>
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
                          {product?.supplierPrice}
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
                          <button
                            onClick={() => deleteItem(item.productId)}
                            className="text-red-500 "
                          >
                            <Trash className="w-6 -h-6 flex-shrink-0" />
                          </button>
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
          <div className="flex justify-end space-x-4 uppercase font-semibold items-center">
            <h2 className="text-sm">Total Amount</h2>
            <p>${totalPrice}</p>
          </div>
          <div className="py-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <TextInput
                register={register}
                errors={errors}
                label="Discount Amount"
                name="discount"
                type="number"
              />
              <TextInput
                register={register}
                errors={errors}
                label="Tax"
                name="tax"
                type="number"
              />
              <TextInput
                register={register}
                errors={errors}
                label="Shipping Cost"
                name="shippingCost"
              />
              <TextInput
                register={register}
                errors={errors}
                label="Balance Amount"
                name="balanceAmount"
              />
            </div>
            <TextArea
              register={register}
              errors={errors}
              label="Add Notes"
              name="notes"
            />
          </div>
          {loading ? (
            <Button disabled>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span>Creating Please wait...</span>
            </Button>
          ) : (
            <Button onClick={handleSubmit(onSubmit)}>
              {editingId ? "Update Purchase" : "Create Purchase"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
