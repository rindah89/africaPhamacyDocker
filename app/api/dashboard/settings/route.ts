import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const settings = await request.json();
    
    // Here you could save settings to database if needed
    // For now, we'll just return success since settings are managed client-side
    console.log('Dashboard settings updated:', settings);
    
    return NextResponse.json({
      success: true,
      message: "Dashboard settings updated successfully",
      settings
    });
    
  } catch (error) {
    console.error("Dashboard settings error:", error);
    return NextResponse.json(
      { error: "Failed to update dashboard settings" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Return default settings - in a real app, you'd fetch from database
    const defaultSettings = {
      autoRefresh: true,
      refreshInterval: 30000,
      compactView: false,
    };
    
    return NextResponse.json({
      success: true,
      settings: defaultSettings
    });
    
  } catch (error) {
    console.error("Dashboard settings fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard settings" },
      { status: 500 }
    );
  }
} 