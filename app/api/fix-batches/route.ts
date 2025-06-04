import { NextRequest, NextResponse } from "next/server";
import { fixOrphanedBatches } from "@/actions/batches";

export async function POST(request: NextRequest) {
  try {
    const result = await fixOrphanedBatches();
    return NextResponse.json(result);
  } catch (error) {
    console.error("API: Error fixing orphaned batches:", error);
    return NextResponse.json(
      { 
        error: "Failed to fix orphaned batches",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 