import { fixNullBatchNumbers } from "@/actions/productBatches";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await fixNullBatchNumbers();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in fix-batches route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fix batch numbers" },
      { status: 500 }
    );
  }
} 