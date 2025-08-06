import BatchForm from "@/components/dashboard/Forms/BatchForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";

export default async function EditBatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [batch, products] = await Promise.all([
    prisma.productBatch.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            name: true,
            productCode: true
          }
        }
      }
    }),
    prisma.product.findMany()
  ]);

  if (!batch) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Edit Batch</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-medium">Product Details</h3>
            <p className="text-sm text-muted-foreground">
              Product: {batch.product.name}
            </p>
            <p className="text-sm text-muted-foreground">
              Code: {batch.product.productCode}
            </p>
          </div>
          <BatchForm editingId={id} initialData={batch} products={products} />
        </CardContent>
      </Card>
    </div>
  );
} 