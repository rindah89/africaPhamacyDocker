import prisma from "@/lib/db";
import PrintBarcodesPage from "./page";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function PrintBarcodesLayout({ searchParams }: { searchParams?: { ids?: string } }) {
  const idsParam = searchParams?.ids?.trim();
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