import { getAllRoles } from "@/actions/roles";
import UserForm from "@/components/dashboard/Forms/UserForm";

export default async function page() {
  const roles = (await getAllRoles()) || [];
  return <UserForm roles={roles} />;
}
