import React from "react";
import { getRoleById } from "@/actions/roles";
import RoleForm from "@/components/dashboard/Forms/RoleForm";

export default async function page({
  params: { id },
}: {
  params: { id: string };
}) {
  const role = await getRoleById(id);
  return <RoleForm editingId={id} initialData={role} />;
}
