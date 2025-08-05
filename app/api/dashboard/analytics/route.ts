import { getAnalytics } from "@/actions/analytics";
import { getSalesAnalyticsSummary } from "@/actions/sales";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');
    
    // Use fast mode for initial loads
    if (mode === 'fast') {
      const summary = await getSalesAnalyticsSummary();
      return NextResponse.json({
        mode: 'fast',
        summary,
        timestamp: new Date().toISOString()
      });
    }
    
    // Full analytics with timeout protection
    const analytics = await Promise.race([
      getAnalytics(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Analytics timeout')), 12000)
      )
    ]);
    
    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Analytics API error:", error);
    
    // Fallback to summary data on timeout
    try {
      const summary = await getSalesAnalyticsSummary();
      return NextResponse.json({ 
        error: "Partial data due to timeout",
        fallback: true,
        summary,
        timestamp: new Date().toISOString()
      }, { status: 206 }); // Partial content
    } catch (fallbackError) {
      return NextResponse.json({ 
        error: "Failed to fetch analytics",
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  }
} 