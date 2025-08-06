import React from "react";
import AdvertForm from "@/components/dashboard/Forms/AdvertForm";
import { getAdvertById } from "@/actions/advert";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const advert = await getAdvertById(id);

  return <AdvertForm editingId={id} initialData={advert} />;
}
