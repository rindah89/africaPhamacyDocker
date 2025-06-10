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

    // Simulate real-time data updates
    // In a real app, you might check for new orders, notifications, etc.
    const now = new Date();
    const lastCheck = new Date(now.getTime() - 30000); // 30 seconds ago
    
    // Mock check for new data
    const hasNewOrders = Math.random() > 0.8; // 20% chance of new orders
    const hasNewNotifications = Math.random() > 0.9; // 10% chance of notifications
    
    const liveData = {
      timestamp: now.toISOString(),
      hasUpdates: hasNewOrders || hasNewNotifications,
      updates: {
        newOrders: hasNewOrders ? Math.floor(Math.random() * 3) + 1 : 0,
        newNotifications: hasNewNotifications ? Math.floor(Math.random() * 2) + 1 : 0,
        lastActivity: now.toISOString(),
      },
      metrics: {
        activeUsers: Math.floor(Math.random() * 50) + 10,
        realtimeOrders: Math.floor(Math.random() * 5),
        systemLoad: Math.random() * 100,
      }
    };
    
    return NextResponse.json({
      success: true,
      ...liveData
    });
    
  } catch (error) {
    console.error("Live data fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch live data" },
      { status: 500 }
    );
  }
} 