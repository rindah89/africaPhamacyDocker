import React from "react";
import { getUserById } from "@/actions/users";
import UserForm from "@/components/dashboard/Forms/UserForm";
import { getAllRoles } from "@/actions/roles";

export default async function page({
  params: { id },
}: {
  params: { id: string };
}) {
  const user = await getUserById(id);
  const roles = (await getAllRoles()) || [];
  return <UserForm roles={roles} editingId={id} initialData={user} />;
}
