import { getProductById } from "@/actions/products";
import BatchForm from "@/components/dashboard/Forms/BatchForm";

export default async function NewBatchPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const product = await getProductById(id);
  if (!product) {
    return <div>Product not found</div>;
  }

  return <BatchForm productId={id} />;
} 