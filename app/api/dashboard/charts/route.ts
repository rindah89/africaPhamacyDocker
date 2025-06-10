import { getSalesCountForPastSevenDays, getRevenueByMainCategoryPastSixMonths } from "@/actions/analytics";
import { NextResponse } from "next/server";

// Force dynamic rendering to prevent static generation timeouts
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Reduce timeout to 8 seconds to stay under database 15s limit
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout after 8s')), 8000)
    );

    console.log('Charts API: Starting data fetch...');
    const startTime = Date.now();

    const dataPromise = Promise.all([
      getSalesCountForPastSevenDays().catch(err => {
        console.error('Failed to fetch sales data:', err);
        return [];
      }),
      getRevenueByMainCategoryPastSixMonths().catch(err => {
        console.error('Failed to fetch revenue data:', err);
        return [];
      })
    ]);

    const [salesData, categoryRevenue] = await Promise.race([dataPromise, timeoutPromise]) as any;

    const duration = Date.now() - startTime;
    console.log(`Charts API: Completed in ${duration}ms`);

    return NextResponse.json({
      salesData: salesData || [],
      categoryRevenue: categoryRevenue || [],
      success: true,
      duration
    });
  } catch (error) {
    console.error("Charts API error:", error);
    
    // Return fallback data instead of error to prevent UI breakage
    return NextResponse.json({ 
      salesData: [],
      categoryRevenue: [],
      success: false,
      error: "Timeout - using fallback data",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 200 }); // Changed to 200 to prevent error state in UI
  }
} 