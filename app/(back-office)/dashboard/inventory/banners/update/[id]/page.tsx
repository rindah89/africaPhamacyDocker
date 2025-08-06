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
import { getAllMainCategories } from "@/actions/main-category";
import { getBannerById } from "@/actions/banner";
import BannerForm from "@/components/dashboard/Forms/BannerForm";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const banner = await getBannerById(id);

  return <BannerForm editingId={id} initialData={banner} />;
}
