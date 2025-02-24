import { getUnitById } from "@/actions/unit";
import UnitForm from "@/components/dashboard/Forms/UnitForm";

export default async function page({
  params: { id },
}: {
  params: { id: string };
}) {
  const unit = await getUnitById(id);
  return <UnitForm editingId={id} initialData={unit} />;
}
