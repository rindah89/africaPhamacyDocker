import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const batches = await prisma.productBatch.findMany({
      where: {
        productId: params.id,
        status: true,
        quantity: {
          gt: 0
        }
      },
      select: {
        id: true,
        batchNumber: true,
        quantity: true
      },
      orderBy: {
        expiryDate: 'asc'
      }
    });

    return NextResponse.json(batches);
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batches' },
      { status: 500 }
    );
  }
} 