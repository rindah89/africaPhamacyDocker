import { getSalesAnalyticsOptimized, getSalesAnalyticsSummary } from "@/actions/sales";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const summaryOnly = searchParams.get('summary') === 'true';
    
    if (summaryOnly) {
      const summary = await getSalesAnalyticsSummary();
      return NextResponse.json({
        success: true,
        data: summary,
        type: 'summary',
        timestamp: new Date().toISOString()
      });
    }
    
    // Get optimized sales data
    const sales = await getSalesAnalyticsOptimized(limit, offset);
    
    return NextResponse.json({
      success: true,
      data: sales,
      count: sales.length,
      limit,
      offset,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Optimized sales API error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch sales data",
      success: false,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}