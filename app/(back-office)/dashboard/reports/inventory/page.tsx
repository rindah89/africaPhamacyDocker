import React from "react";
import { getAllProducts } from "@/actions/products";
import InventoryReport from "@/components/dashboard/Reports/InventoryReport";

export default async function page() {
  const products = (await getAllProducts()) || [];
  return <InventoryReport products={products} />;
}
