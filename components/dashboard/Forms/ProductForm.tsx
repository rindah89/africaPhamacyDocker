"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactBarcode } from "react-jsbarcode";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import FormHeader from "./FormHeader";
import { useRouter } from "next/navigation";
import Select from "react-tailwindcss-select";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ProductProps } from "@/types/types";

import TextInput from "@/components/global/FormInputs/TextInput";
import TextArea from "@/components/global/FormInputs/TextArea";
import { generateSlug } from "@/lib/generateSlug";
import toast from "react-hot-toast";
import {
  Options,
  SelectValue,
} from "react-tailwindcss-select/dist/components/type";
import { Category, Product } from "@prisma/client";
import AddNewButton from "@/components/AddNewButton";
import FormSelectInput from "@/components/global/FormInputs/FormSelectInput";
import { Barcode, Eye, RefreshCcw } from "lucide-react";
import MultipleImageInput from "@/components/global/FormInputs/MultipleImageInput";
import { useReactToPrint } from "react-to-print";
import { createProduct, updateProductById } from "@/actions/products";
import { convertDateToIso } from "@/lib/convertDateToIso";
import FormFooter from "./FormFooter";
import { convertIsoToDateString } from "@/lib/covertDateToDateString";
// import NovelEditor from "@/components/global/FormInputs/NovelEditor";
import dynamic from "next/dynamic";
const QuillEditor = dynamic(
  () => import("@/components/global/FormInputs/QuillEditor"),
  {
    ssr: false,
  }
);

type ProductFormProps = {
  editingId?: string | undefined;
  initialData?: Product | undefined | null;
  categories: any;
  brands: Options;
  suppliers: Options;
  units: Options;
};
export default function ProductForm({
  editingId,
  initialData,
  categories,
  brands,
  suppliers,

  units,
}: ProductFormProps) {
  const router = useRouter();
  const taxMethods = [
    {
      label: "Inclusive",
      value: "inclusive",
    },
    {
      label: "Exclusive",
      value: "exclusive",
    },
  ];
  const initialTaxMethodValue = initialData?.taxMethod;
  const initialTaxMethod = taxMethods.find(
    (item: any) => item.value === initialTaxMethodValue
  );
  const [loading, setLoading] = useState(false);
  const initialImages = initialData?.productImages || [
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
  ];
  const [productImages, setProductImages] = useState(initialImages);
  const initialStatus = {
    value: initialData?.status == true ? "true" : "false",
    label: initialData?.status == true ? "Active" : "Disabled",
  };
  const [status, setStatus] = useState<any>(initialStatus);
  const options: Options = [
    { value: "true", label: "Active" },
    { value: "false", label: "Disabled" },
  ];
  const initialCategoryId = initialData?.subCategoryId;
  const initialCategory = categories.find(
    (item: any) => item.value === initialCategoryId
  );
  const initialBrandId = initialData?.brandId;
  const initialBrand = brands.find(
    (item: any) => item.value === initialBrandId
  );

  const initialSupplierId = initialData?.supplierId;
  const initialSupplier = suppliers.find(
    (item: any) => item.value === initialSupplierId
  );
  const initialUnitId = initialData?.unitId;
  const initialUnit = units.find((item: any) => item.value === initialUnitId);
  const [selectedCategory, setSelectedCategory] =
    useState<any>(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState<any>(initialBrand);
  const [selectedSupplier, setSelectedSupplier] =
    useState<any>(initialSupplier);

  const [selectedUnit, setSelectedUnit] = useState<any>(initialUnit);
  const [selectedTaxMethod, setSelectedTaxMethod] =
    useState<any>(initialTaxMethod);
  const [showBarcode, setShowBarcode] = useState(false);
  const initialProductCode = initialData?.productCode ?? "";
  
  
  const [barcode, setBarcode] = useState<string>(initialProductCode);
  
  
  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });
  // const productCode =watch("productCode")
  // console.log(productCode)
  // console.log(selectedBrand);
  const handleChange = (item: SelectValue) => {
    // console.log("value:", item);
    setStatus(item);
  };
  const generateNineDigitNumber = (): string => {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
  };
  const generateBarcode = () => {
    const nineDigitNumber = generateNineDigitNumber();
    setBarcode(nineDigitNumber);
    setShowBarcode(true);
    // Generate the barcode using JsBarcode
    // JsBarcode("#barcode", nineDigitNumber, {
    //   format: "CODE128",
    // });
  };
  const initialContent = initialData?.content || undefined;
  const [content, setContent] = useState<string | undefined>(initialContent);
  console.log(content);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProductProps>({
    defaultValues: {
      name: initialData?.name,
      stockQty: initialData ? initialData.stockQty : 0,
      productCost: initialData?.productCost,
      productPrice: initialData?.productPrice,
      supplierPrice: initialData?.supplierPrice,
      alertQty: initialData?.alertQty,
      productTax: initialData?.productTax,
      taxMethod: initialData?.taxMethod,
      productDetails: initialData?.productDetails,
      isFeatured: initialData?.isFeatured,
    },
  });
  // console.log(productImages);
  async function saveProduct(data: ProductProps) {
    try {
      if (!barcode) {
        toast.error("Please generate the Barcode");
        return;
      }
      setLoading(true);
      data.slug = generateSlug(data.name);
      data.status = status && status.value == "true" ? true : false;
      data.productImages = productImages;
      data.subCategoryId = selectedCategory.value;
      data.supplierId = selectedSupplier.value;
      data.unitId = selectedUnit.value;
      data.brandId = selectedBrand.value;
      data.taxMethod = selectedTaxMethod.value;
      data.productThumbnail = productImages[0];
      data.alertQty = Number(data.alertQty);
      data.productCost = Number(data.productCost);
      data.supplierPrice = Number(data.supplierPrice);
      data.productPrice = Number(data.productPrice);
      data.productTax = Number(data.productTax);
      data.stockQty = editingId ? Number(data.stockQty) : 0;
      data.productCode = barcode;
      data.content = content;

      if (editingId) {
        await updateProductById(editingId, data);
        setLoading(false);
        toast.success("Updated Successfully!");
        reset();
        router.push("/dashboard/inventory/products");
      } else {
        const res = await createProduct(data);
        if (res.success && res.error == null) {
          setLoading(false);
          toast.success("Product Successfully Created!");
          reset();
          router.push("/dashboard/inventory/products");
        } else {
          toast.error("Something went wrong, Please try again");
          console.log(res.error);
        }
      }
    } catch (error) {
      setLoading(false);
      toast.error("⚠️ Please Fill in all the Fields 🔥");
      console.log(error);
    }
  }

  // console.log(status);

  return (
    <form className="" onSubmit={handleSubmit(saveProduct)}>
      <FormHeader
        href="/products"
        title="Product"
        editingId={editingId}
        loading={loading}
      />
      <div className="grid grid-cols-12 gap-6 py-8">
        <div className="lg:col-span-8 col-span-full space-y-4 ">
          <Card>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3 pt-3">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Product Name"
                    name="name"
                  />
                </div>
                <div className="grid gap-3">
                  <TextArea
                    register={register}
                    errors={errors}
                    label="Product Description"
                    name="productDetails"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                <FormSelectInput
                  label="Sub Categories"
                  options={categories}
                  option={selectedCategory}
                  setOption={setSelectedCategory}
                  toolTipText="Add New Sub Category"
                  href="/dashboard/inventory/sub-categories/new"
                />
                <FormSelectInput
                  label="Brands"
                  options={brands}
                  option={selectedBrand}
                  setOption={setSelectedBrand}
                  toolTipText="Add New Brand"
                  href="/dashboard/inventory/brands/new"
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                <FormSelectInput
                  label="Suppliers"
                  options={suppliers}
                  option={selectedSupplier}
                  setOption={setSelectedSupplier}
                  toolTipText="Add New Supplier"
                  href="/dashboard/inventory/suppliers/new"
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                <FormSelectInput
                  label="Units"
                  options={units}
                  option={selectedUnit}
                  setOption={setSelectedUnit}
                  toolTipText="Add New Unit"
                  href="/dashboard/inventory/units/new"
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Quantity Alert"
                  name="alertQty"
                  type="number"
                  toolTipText="After this stock quanity it will enable low stock warning."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                <TextInput
                  register={register}
                  errors={errors}
                  label="Product Cost"
                  name="productCost"
                  type="number"
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Product Price"
                  name="productPrice"
                  type="number"
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                <div className="relative flex gap-x-3">
                  <div className="flex h-6 items-center">
                    <input
                      {...register("isFeatured")}
                      id="featured"
                      name="isFeatured"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                  </div>
                  <div className="text-sm leading-6">
                    <label
                      htmlFor="featured"
                      className="font-medium text-gray-900"
                    >
                      Featured
                    </label>
                    <p className="text-gray-500">
                      Featured Products will be used in POS
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="">
            <CardContent>
              <div className="pt-3">
                <QuillEditor
                  label="Product Content"
                  className=""
                  value={content}
                  onChange={setContent}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-4 col-span-full ">
          <div className="grid auto-rows-max items-start gap-4 ">
            <Card>
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <Select
                    isSearchable
                    primaryColor="blue"
                    value={status}
                    onChange={handleChange}
                    options={options}
                    placeholder="Status"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1  gap-3 pt-3">
                  <div className="flex items-end space-x-2">
                    <div>
                      <div className="flex space-x-2 items-center">
                        <label
                          htmlFor="productCode"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Bar Code
                        </label>
                      </div>
                      <div className="mt-2">
                        <input
                          id="productCode"
                          type="text"
                          value={barcode}
                          onChange={(e) => setBarcode(e.target.value)}
                          className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 text-sm"
                        />
                      </div>
                    </div>

                    {showBarcode ? (
                      <Dialog>
                        <DialogTrigger>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button type="button" variant="outline">
                                  <Barcode className="w-6 h-6" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Barcode</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Barcode</DialogTitle>
                            <DialogDescription>
                              This is the barcode preview, and you can go ahead
                              and print it
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid place-items-center gap-4 py-4">
                            <div
                              ref={componentRef}
                            >
                              <ReactBarcode
                                value={barcode}
                                options={{ format: "CODE128" }}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handlePrint} type="button">
                              Print Barcode
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button
                        type="button"
                        variant={"outline"}
                        size={"sm"}
                        onClick={generateBarcode}
                      >
                        <RefreshCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {editingId && (
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Product Stock Qty"
                    name="stockQty"
                    type="number"
                  />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 pt-3">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Product Tax"
                    name="productTax"
                    type="number"
                    unit="%"
                    toolTipText="The Product Tax is in percentage eg 3 =>3%"
                  />
                  <FormSelectInput
                    label="Tax Methods"
                    options={taxMethods}
                    option={selectedTaxMethod}
                    setOption={setSelectedTaxMethod}
                  />
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Supplier Price"
                    name="supplierPrice"
                    type="number"
                  />
                </div>
              </CardContent>
            </Card>
            <MultipleImageInput
              title="Product Images"
              imageUrls={productImages}
              setImageUrls={setProductImages}
              endpoint="productImages"
            />
          </div>
        </div>
      </div>
      <FormFooter
        href="/products"
        editingId={editingId}
        loading={loading}
        title="Product"
      />
    </form>
  );
}
