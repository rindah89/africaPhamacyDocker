import prisma from "@/lib/db";
import PrintBarcodesPage from "./page";

export default async function PrintBarcodesLayout() {
  const batches = await prisma.productBatch.findMany({
    include: {
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