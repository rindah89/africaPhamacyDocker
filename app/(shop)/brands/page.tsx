import { getAllBrands } from "@/actions/brand";
import BrandList from "@/components/frontend/listings/BrandList";
import React from "react";
import { BreadcrumbProps } from "../product/[slug]/page";
import { CustomBreadCrumb } from "@/components/frontend/CustomBreadCrumb";

export default async function page() {
  const brands = (await getAllBrands()) || [];
  const breadcrumb: BreadcrumbProps[] = [
    { label: "Home", href: "/" },
    { label: "Brands", href: `/brands` },
  ];
  return (
    <div className="container py-8">
      <div className=" py-4 border-t">
        <CustomBreadCrumb breadcrumb={breadcrumb} />
      </div>
      <BrandList title="All Brands" link="" brands={brands} />
    </div>
  );
}
