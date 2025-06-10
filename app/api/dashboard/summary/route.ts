import { getBestSellingProducts } from "@/actions/products";
import { getRecentOrdersForDashboard } from "@/actions/pos";
import { getRecentCustomersForDashboard } from "@/actions/orders";
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
      getRecentOrdersForDashboard(5).catch(e => {
        console.error("Failed to fetch recent orders:", e);
        return { error: true, message: e.message || "Error fetching orders" };
      }),
      getBestSellingProducts(5).catch(e => {
        console.error("Failed to fetch best selling products:", e);
        return { error: true, message: e.message || "Error fetching products" };
      }),
      getRecentCustomersForDashboard(5).catch(e => {
        console.error("Failed to fetch recent customers:", e);
        return { error: true, message: e.message || "Error fetching customers" };
      })
    ]);

    const [orders, products, customers] = await Promise.race([dataPromise, timeoutPromise]);

    return NextResponse.json({
      ordersData: orders,
      bestSellingProducts: Array.isArray(products) ? products : [],
      customersData: customers,
      success: true
    });
  } catch (error) {
    console.error("Summary API error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch summary data", 
      message: error instanceof Error ? error.message : "Unknown error",
      ordersData: { error: true, message: "Timeout or error" },
      bestSellingProducts: [],
      customersData: { error: true, message: "Timeout or error" },
      success: false 
    }, { status: 500 });
  }
} 