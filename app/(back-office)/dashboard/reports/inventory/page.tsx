import React from "react";
import { getAllProducts } from "@/actions/products";
import InventoryReport from "@/components/dashboard/Reports/InventoryReport";
import { IProduct } from "@/types/types";

export default async function page() {
  const products = await getAllProducts();
  if (!products) return <div>Error loading products</div>;
  
  return <InventoryReport products={products} />;
}
