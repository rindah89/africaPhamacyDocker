"use client";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import 'jspdf-autotable';

import { ScrollArea } from "@/components/ui/scroll-area";
import { ExcelCategoryProps, ProductProps, SelectOption } from "@/types/types";
import {
  Check,
  CloudUpload,
  Delete,
  File,
  ListFilter,
  Loader2,
  PlusCircle,
  Search,
  X,
  FileDown,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { RiFileExcel2Line } from "react-icons/ri";
import { SiMicrosoftexcel } from "react-icons/si";
import Select from "react-tailwindcss-select";
import {
  Options,
  SelectValue,
} from "react-tailwindcss-select/dist/components/type";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogDemo } from "./Button";
import { formatBytes } from "@/lib/formatBytes";
import { generateSlug } from "@/lib/generateSlug";
import { createBulkCategories } from "@/actions/category";
import toast from "react-hot-toast";
import exportDataToExcel from "@/lib/exportDataToExcel";
import { createBulkBrands } from "@/actions/brand";
import { createBulkSuppliers } from "@/actions/supplier";
import { createBulkUnits } from "@/actions/unit";
import { createBulkProducts } from "@/actions/products";
type TableHeaderProps = {
  title: string;
  href: string;
  linkTitle: string;
  data: any;
  model: string;
  showImport?: boolean;
  showPdfExport?: boolean;
  customExportPDF?: (data: any[]) => void;
};
function handleExportPDF(data: any[]) {
  const doc = new jsPDF();
  const tableColumn = ["Product Name", "Quantity", "Expiry Date"];
  const tableRows = data.map((item) => [
    item.name,
    item.stockQty.toString(),
    item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "N/A",
  ]);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
  });

  doc.save("inventory-report.pdf");
}
export default function TableHeader({
  title,
  href,
  linkTitle,
  data,
  model,
  showImport = true,
  showPdfExport = false,
  customExportPDF,
}: TableHeaderProps) {
  const [status, setStatus] = useState<SelectValue>(null);
  const [date, setDate] = useState<SelectValue>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState("");
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  let excelDownload = "#";
  if (model === "category") {
    excelDownload = "/Categories.xlsx";
  } else if (model === "brand") {
    excelDownload = "/Brands.xlsx";
  }  else if (model === "supplier") {
    excelDownload = "/Suppliers.xlsx";
  } else if (model === "unit") {
    excelDownload = "/Units.xlsx";
  } else if (model === "product") {
    excelDownload = "/Products.xlsx";
  }
  console.log(excelFile);
  const options: Options = [
    { value: "true", label: "Active" },
    { value: "false", label: "Disabled" },
  ];
  const dateOptions: Options = [
    { value: "lastMonth", label: "Last Month" },
    { value: "thisMonth", label: "This Month" },
  ];
  const handleStatusChange = (item: SelectValue) => {
    console.log("value:", item);
    setStatus(item);
  };
  const handleDateChange = (item: SelectValue) => {
    console.log("value:", item);
    setDate(item);
  };

  function previewData() {
    setPreview(true);
    if (excelFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        if (data) {
          const workbook = XLSX.read(data, { type: "binary" });
          // SheetName
          const sheetName = workbook.SheetNames[0];
          // Worksheet
          const workSheet = workbook.Sheets[sheetName];
          // Json
          const json = XLSX.utils.sheet_to_json(workSheet);
          setJsonData(JSON.stringify(json, null, 2));
        }
      };
      reader.readAsBinaryString(excelFile);
    }
  }
  function saveData() {
    setPreview(false);
    if (excelFile) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        if (data) {
          const workbook = XLSX.read(data, { type: "binary" });
          // SheetName
          const sheetName = workbook.SheetNames[0];
          // Worksheet
          const workSheet = workbook.Sheets[sheetName];
          // Json
          const json = XLSX.utils.sheet_to_json(workSheet);
          setJsonData(JSON.stringify(json, null, 2));

          try {
            setLoading(true);
            if (model === "category") {
              const categories = json.map((item: any) => {
                return {
                  title: item.Title,
                  slug: generateSlug(item.Title),
                  description: item.Description,
                  imageUrl: item.Image,
                  mainCategoryId: item.mainCategoryId,
                  status: true,
                };
              });
              await createBulkCategories(categories);
            } else if (model === "brand") {
              const brands = json.map((item: any) => {
                return {
                  title: item.Title,
                  slug: generateSlug(item.Title),
                  logo: item.Logo,
                  status: true,
                };
              });
              await createBulkBrands(brands);
              // console.log(brands);
            
            } else if (model === "supplier") {
              const suppliers = json.map((item: any) => {
                return {
                  name: item.name,
                  imageUrl: item.imageUrl,
                  country: item.country,
                  city: item.city,
                  phone: String(item.phone),
                  email: item.email,
                  state: item.state,
                  companyName: item.companyName,
                  vatNumber: String(item.vatNumber),
                  address: item.address,
                  postalCode: String(item.postalCode),
                  status: true,
                };
              });
              await createBulkSuppliers(suppliers);
              // console.log(suppliers);
            } else if (model === "unit") {
              const units = json.map((item: any) => {
                return {
                  title: item.title,
                  abbreviation: item.abbreviation,
                };
              });
              await createBulkUnits(units);
              // console.log(brands);
            } else if (model === "product") {
              const products = json.map((item: any) => {
                return {
                  name: item.name,
                  slug: generateSlug(item.name),
                  productCode: item.productCode,
                  stockQty: item.stockQty,
                  brandId: item.brandId,
                  supplierId: item.supplierId,
                  categoryId: item.categoryId,
                  unitId: item.unitId,
                  productCost: item.productCost,
                  productPrice: item.productPrice,
                  alertQty: item.alertQty,
                  productTax: item.productTax,
                  productThumbnail: item.productThumbnail,
                  taxMethod: item.taxMethod,
                  status: true,
                  productImages: [...item.productThumbnail],
                  productDetails: item.productDetails,
                };
              });
              await createBulkProducts(products as any);
              // console.log(brands);
            }
            setLoading(false);
            setUploadSuccess(true);
            // window.location.reload();
            // toast.success("All Data Synced Successfully with No errors 👍");
          } catch (error) {
            setUploadSuccess(false);
            setLoading(false);
            toast.error("Something went wrong, Please Try again 😢");
            console.log(error);
          }
        }
      };
      reader.readAsBinaryString(excelFile);
    }
  }
  function handleExportData() {
    console.log("data exported");
    const today = new Date();
    const filename = `Exported ${title} ${today.toDateString()}`;
    // console.log(filename);
    exportDataToExcel(data, filename);
  }
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between py-4">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <div className="flex items-center gap-2">
          {showPdfExport && (
            <Button
              variant="outline"
              size="sm"
              className="ml-auto h-8 lg:flex"
              onClick={() => customExportPDF ? customExportPDF(data) : handleExportPDF(data)}
            >
              <FileDown className="mr-2 h-4 w-4" />
              PDF Report
            </Button>
          )}
          <Button asChild>
            <Link href={href}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {linkTitle}
            </Link>
          </Button>
        </div>
      </div>
      {/* ... rest of the component ... */}
    </div>
  );
}