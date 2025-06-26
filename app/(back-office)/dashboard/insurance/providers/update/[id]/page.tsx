import InsuranceProviderForm from "@/components/dashboard/Forms/InsuranceProviderForm";
import { getInsuranceProviderById } from "@/actions/insurance";

export default async function page({
  params: { id },
}: {
  params: { id: string };
}) {
  const provider = await getInsuranceProviderById(id);
  return <InsuranceProviderForm editingId={id} initialData={provider} />;
} 