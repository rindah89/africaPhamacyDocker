import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/authOptions";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Simulate real-time sales data updates
    // In a real app, you might check for new sales, orders, etc.
    const now = new Date();
    const lastCheck = new Date(now.getTime() - 30000); // 30 seconds ago
    
    // Mock check for new data
    const hasNewSales = Math.random() > 0.7; // 30% chance of new sales
    const hasUpdatedTotals = Math.random() > 0.8; // 20% chance of updated totals
    
    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      hasUpdates: hasNewSales || hasUpdatedTotals,
      updates: {
        newSales: hasNewSales ? Math.floor(Math.random() * 5) + 1 : 0,
        updatedTotals: hasUpdatedTotals,
        lastSaleTime: hasNewSales ? now.toISOString() : null,
      },
      message: hasNewSales ? "New sales data available" : "No new updates"
    });
    
  } catch (error) {
    console.error("Live sales data error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch live sales data",
        success: false,
        hasUpdates: false
      },
      { status: 500 }
    );
  }
} 