import Link from "next/link";
import React from "react";
import Image from "next/image";
import {
  ChevronLeft,
  Home,
  LineChart,
  Package,
  Package2,
  PanelLeft,
  PlusCircle,
  Search,
  Settings,
  ShoppingCart,
  Upload,
  Users2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import CategoryForm from "@/components/dashboard/Forms/CategoryForm";
import FormHeader from "@/components/dashboard/Forms/FormHeader";
import { getCategoryById } from "@/actions/category";
import { getBrandById } from "@/actions/brand";
import BrandForm from "@/components/dashboard/Forms/BrandForm";

export default async function page({
  params: { id },
}: {
  params: { id: string };
}) {
  const brand = await getBrandById(id);
  return <BrandForm editingId={id} initialData={brand} />;
}
