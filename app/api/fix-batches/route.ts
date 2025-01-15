import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST() {
  try {
    // Find orphaned batches directly with a single query
    const orphanedBatches = await prisma.productBatch.findMany({
      where: {
        productId: {
          not: {
            in: await prisma.product.findMany({
              select: { id: true }
            }).then(products => products.map(p => p.id))
          }
        }
      },
      select: {
        id: true,
        batchNumber: true
      }
    });

    if (orphanedBatches.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No orphaned batches found",
        orphanedBatches: []
      });
    }

    // Delete the orphaned batches
    const deleteResult = await prisma.productBatch.deleteMany({
      where: {
        id: {
          in: orphanedBatches.map(batch => batch.id)
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deleteResult.count} orphaned batches`,
      orphanedBatches
    });
  } catch (error) {
    console.error("Error fixing batches:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fix batches",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 