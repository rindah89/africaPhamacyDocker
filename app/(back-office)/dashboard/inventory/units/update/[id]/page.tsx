import { getUnitById } from "@/actions/unit";
import UnitForm from "@/components/dashboard/Forms/UnitForm";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const unit = await getUnitById(id);
  return <UnitForm editingId={id} initialData={unit} />;
}
