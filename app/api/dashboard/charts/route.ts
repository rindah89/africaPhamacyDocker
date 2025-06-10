import { getSalesCountForPastSevenDays, getRevenueByMainCategoryPastSixMonths } from "@/actions/analytics";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [salesData, categoryRevenue] = await Promise.all([
      getSalesCountForPastSevenDays().catch(err => {
        console.error('Failed to fetch sales data:', err);
        return null;
      }),
      getRevenueByMainCategoryPastSixMonths().catch(err => {
        console.error('Failed to fetch revenue data:', err);
        return null;
      })
    ]);

    return NextResponse.json({
      salesData,
      categoryRevenue,
      success: true
    });
  } catch (error) {
    console.error("Charts API error:", error);
    return NextResponse.json({ error: "Failed to fetch charts data" }, { status: 500 });
  }
} 