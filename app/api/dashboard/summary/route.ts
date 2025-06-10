import { getBestSellingProducts } from "@/actions/products";
import { getRecentOrdersForDashboard } from "@/actions/pos";
import { getRecentCustomersForDashboard } from "@/actions/orders";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [orders, products, customers] = await Promise.all([
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

    return NextResponse.json({
      ordersData: orders,
      bestSellingProducts: Array.isArray(products) ? products : [],
      customersData: customers,
      success: true
    });
  } catch (error) {
    console.error("Summary API error:", error);
    return NextResponse.json({ error: "Failed to fetch summary data" }, { status: 500 });
  }
} 