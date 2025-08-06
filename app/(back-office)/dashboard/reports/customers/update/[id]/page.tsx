import React from "react";
import { getUserById } from "@/actions/users";
import UserForm from "@/components/dashboard/Forms/UserForm";
import { getAllRoles } from "@/actions/roles";
import { getCustomerById } from "@/actions/customer";
import CustomerForm from "@/components/dashboard/Forms/CustomerForm";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomerById(id);
  const roles = (await getAllRoles()) || [];
  return <CustomerForm roles={roles} editingId={id} initialData={customer} />;
}
