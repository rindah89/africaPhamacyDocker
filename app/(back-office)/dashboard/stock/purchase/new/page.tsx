import { getAllProducts } from "@/actions/products";
import { getAllSuppliers } from "@/actions/supplier";
import AdjustmentForm from "@/components/dashboard/Forms/AdjstmentForm";
import PurchaseForm from "@/components/dashboard/Forms/PurchaseForm";
import React from "react";

export default async function page() {
  const products = (await getAllProducts()) || [];
  const suppliers = (await getAllSuppliers()) || [];
  return (
    <div>
      <PurchaseForm products={products} suppliers={suppliers} />
    </div>
  );
}
