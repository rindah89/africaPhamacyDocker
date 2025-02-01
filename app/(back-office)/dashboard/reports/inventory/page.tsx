import React from "react";
import { getAllProducts } from "@/actions/products";
import InventoryReport from "@/components/dashboard/Reports/InventoryReport";
import { IProduct } from "@/types/types";

export default async function page() {
  const products = (await getAllProducts()) || [];
  return <InventoryReport products={products as IProduct[]} />;
}
