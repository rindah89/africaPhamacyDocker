import BatchForm from "@/components/dashboard/Forms/BatchForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";

export default async function NewBatchPage({
  searchParams,
}: {
  searchParams: { productId?: string };
}) {
  const products = await prisma.product.findMany();
  
  // If productId is provided, verify it exists
  if (searchParams.productId) {
    const product = await prisma.product.findUnique({
      where: { id: searchParams.productId },
    });
    if (!product) {
      redirect("/dashboard/inventory/products");
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Add New Batch</CardTitle>
        </CardHeader>
        <CardContent>
          <BatchForm productId={searchParams.productId} products={products} />
        </CardContent>
      </Card>
    </div>
  );
} 