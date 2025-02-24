import { getAllProducts } from "@/actions/products";
import AdjustmentForm from "@/components/dashboard/Forms/AdjstmentForm";
import React from "react";
import { getAdjustments } from "@/actions/adjustments";
import prisma from "@/lib/db";

async function getAdjustmentById(id: string) {
  try {
    const adjustment = await prisma.adjustment.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });
    return adjustment;
  } catch (error) {
    console.error("Error fetching adjustment:", error);
    throw error;
  }
}

export default async function UpdateAdjustmentPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const products = (await getAllProducts()) || [];
  const adjustment = await getAdjustmentById(id);

  if (!adjustment) {
    return <div>Adjustment not found</div>;
  }

  return (
    <div>
      <AdjustmentForm products={products} initialData={adjustment} editingId={id} />
    </div>
  );
} 