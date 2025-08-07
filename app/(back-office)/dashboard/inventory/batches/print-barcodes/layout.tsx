import prisma from "@/lib/db";
import PrintBarcodesPage from "./page";

export default async function PrintBarcodesLayout() {
  const batches = await prisma.productBatch.findMany({
    select: {
      id: true,
      batchNumber: true,
      quantity: true,
      expiryDate: true,
      deliveryDate: true,
      createdAt: true,
      product: {
        select: {
          name: true,
          productCode: true,
          productPrice: true,
          supplier: {
            select: {
              name: true,
            }
          }
        }
      }
    },
    where: {
      status: true
    },
    orderBy: {
      expiryDate: 'asc'
    }
  });

  return <PrintBarcodesPage batches={batches} />;
} 