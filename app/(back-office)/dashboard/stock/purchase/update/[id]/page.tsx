import { getAllProducts } from "@/actions/products";
import { getPurchaseOrderById } from "@/actions/purchases";
import { getAllSuppliers } from "@/actions/supplier";
import AdjustmentForm from "@/components/dashboard/Forms/AdjstmentForm";
import PurchaseForm from "@/components/dashboard/Forms/PurchaseForm";
import React from "react";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const products = (await getAllProducts()) || [];
  const suppliers = (await getAllSuppliers()) || [];
  const purchase = await getPurchaseOrderById(id);
  return (
    <div>
      <PurchaseForm
        products={products}
        suppliers={suppliers}
        initialData={purchase}
        editingId={id}
      />
    </div>
  );
}
