import { getAllProducts } from "@/actions/products";
import AdjustmentForm from "@/components/dashboard/Forms/AdjstmentForm";
import React from "react";

export default async function page() {
  const products = (await getAllProducts()) || [];
  return (
    <div>
      <AdjustmentForm products={products} />
    </div>
  );
}
