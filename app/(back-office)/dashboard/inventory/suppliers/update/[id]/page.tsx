import SupplierForm from "@/components/dashboard/Forms/SupplierForm";
import { getSupplierById } from "@/actions/supplier";
export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplier = await getSupplierById(id);
  return <SupplierForm editingId={id} initialData={supplier} />;
}
