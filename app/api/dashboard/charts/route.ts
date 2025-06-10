import { getSalesCountForPastSevenDays, getRevenueByMainCategoryPastSixMonths } from "@/actions/analytics";
import { NextResponse } from "next/server";

// Force dynamic rendering to prevent static generation timeouts
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 30000)
    );

    const dataPromise = Promise.all([
      getSalesCountForPastSevenDays().catch(err => {
        console.error('Failed to fetch sales data:', err);
        return null;
      }),
      getRevenueByMainCategoryPastSixMonths().catch(err => {
        console.error('Failed to fetch revenue data:', err);
        return null;
      })
    ]);

    const [salesData, categoryRevenue] = await Promise.race([dataPromise, timeoutPromise]);

    return NextResponse.json({
      salesData,
      categoryRevenue,
      success: true
    });
  } catch (error) {
    console.error("Charts API error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch charts data", 
      message: error instanceof Error ? error.message : "Unknown error",
      salesData: null,
      categoryRevenue: null,
      success: false 
    }, { status: 500 });
  }
} 