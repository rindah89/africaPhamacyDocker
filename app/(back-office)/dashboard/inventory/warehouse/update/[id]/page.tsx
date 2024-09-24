import React from "react";
import { getWarehouseById } from "@/actions/warehouse";
import WarehouseForm from "@/components/dashboard/Forms/WarehouseForm";

export default async function page({
  params: { id },
}: {
  params: { id: string };
}) {
  const warehouse = await getWarehouseById(id);
  return <WarehouseForm editingId={id} initialData={warehouse} />;
}
