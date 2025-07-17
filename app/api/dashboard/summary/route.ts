import { getBestSellingProducts } from "@/actions/products";
import { getRecentOrdersForDashboard } from "@/actions/pos";
import { getRecentCustomersForDashboard } from "@/actions/orders";
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

    const startTime = Date.now();

    const dataPromise = Promise.all([
      getRecentOrdersForDashboard(5).then(result => {
        return result;
      }).catch(e => {
        return [];
      }),
      
      getBestSellingProducts(5).then(result => {
        return result;
      }).catch(e => {
        return [];
      }),
      
      getRecentCustomersForDashboard(5).then(result => {
        return result;
      }).catch(e => {
        return [];
      })
    ]);

    const [orders, products, customers] = await Promise.race([dataPromise, timeoutPromise]) as any;

    const duration = Date.now() - startTime;

    const responseData = {
      ordersData: orders || [],
      bestSellingProducts: Array.isArray(products) ? products : [],
      customersData: customers || [],
      success: true,
      duration
    };

    return NextResponse.json(responseData);
  } catch (error) {
    // Return fallback data instead of error to prevent UI breakage
    const fallbackData = { 
      ordersData: [],
      bestSellingProducts: [],
      customersData: [],
      success: false,
      error: "Timeout - using fallback data",
      message: error instanceof Error ? error.message : "Unknown error"
    };
    
    return NextResponse.json(fallbackData, { status: 200 }); // Return 200 to prevent error state in UI
  }
} 