import SupplierForm from "@/components/dashboard/Forms/SupplierForm";
import { getSupplierById } from "@/actions/supplier";
export default async function page({
  params: { id },
}: {
  params: { id: string };
}) {
  const supplier = await getSupplierById(id);
  return <SupplierForm editingId={id} initialData={supplier} />;
}
