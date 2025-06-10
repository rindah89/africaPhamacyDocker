import { getBestSellingProducts } from "@/actions/products";
import { getRecentOrdersForDashboard } from "@/actions/pos";
import { getRecentCustomersForDashboard } from "@/actions/orders";
import { NextResponse } from "next/server";

// Force dynamic rendering to prevent static generation timeouts
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  console.log('🔍 Dashboard Summary API - GET request started');
  
  try {
    // Reduce timeout to 8 seconds to stay under database 15s limit
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout after 8s')), 8000)
    );

    console.log('🔍 Dashboard Summary API - Starting data fetch...');
    const startTime = Date.now();

    console.log('🔍 Dashboard Summary API - Calling individual data functions...');
    const dataPromise = Promise.all([
      getRecentOrdersForDashboard(5).then(result => {
        console.log('🔍 Dashboard Summary API - Recent orders result:', {
          success: true,
          count: Array.isArray(result) ? result.length : 'not array',
          type: typeof result,
          data: result
        });
        return result;
      }).catch(e => {
        console.error("🔍 Dashboard Summary API - Failed to fetch recent orders:", e);
        return [];
      }),
      
      getBestSellingProducts(5).then(result => {
        console.log('🔍 Dashboard Summary API - Best selling products result:', {
          success: true,
          count: Array.isArray(result) ? result.length : 'not array',
          type: typeof result,
          data: result
        });
        return result;
      }).catch(e => {
        console.error("🔍 Dashboard Summary API - Failed to fetch best selling products:", e);
        return [];
      }),
      
      getRecentCustomersForDashboard(5).then(result => {
        console.log('🔍 Dashboard Summary API - Recent customers result:', {
          success: true,
          count: Array.isArray(result) ? result.length : 'not array',
          type: typeof result,
          data: result
        });
        return result;
      }).catch(e => {
        console.error("🔍 Dashboard Summary API - Failed to fetch recent customers:", e);
        return [];
      })
    ]);

    console.log('🔍 Dashboard Summary API - Waiting for all promises to resolve...');
    const [orders, products, customers] = await Promise.race([dataPromise, timeoutPromise]) as any;

    const duration = Date.now() - startTime;
    console.log(`🔍 Dashboard Summary API - All data fetched successfully in ${duration}ms`);
    
    console.log('🔍 Dashboard Summary API - Final data:', {
      orders: {
        type: typeof orders,
        isArray: Array.isArray(orders),
        count: Array.isArray(orders) ? orders.length : 'not array',
        data: orders
      },
      products: {
        type: typeof products,
        isArray: Array.isArray(products),
        count: Array.isArray(products) ? products.length : 'not array',
        data: products
      },
      customers: {
        type: typeof customers,
        isArray: Array.isArray(customers),
        count: Array.isArray(customers) ? customers.length : 'not array',
        data: customers
      }
    });

    const responseData = {
      ordersData: orders || [],
      bestSellingProducts: Array.isArray(products) ? products : [],
      customersData: customers || [],
      success: true,
      duration
    };
    
    console.log('🔍 Dashboard Summary API - Returning response:', {
      success: true,
      ordersCount: responseData.ordersData.length,
      productsCount: responseData.bestSellingProducts.length,
      customersCount: responseData.customersData.length,
      duration
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("🔍 Dashboard Summary API - Error occurred:", error);
    
    // Return fallback data instead of error to prevent UI breakage
    const fallbackData = { 
      ordersData: [],
      bestSellingProducts: [],
      customersData: [],
      success: false,
      error: "Timeout - using fallback data",
      message: error instanceof Error ? error.message : "Unknown error"
    };
    
    console.log('🔍 Dashboard Summary API - Returning fallback data:', fallbackData);
    
    return NextResponse.json(fallbackData, { status: 200 }); // Return 200 to prevent error state in UI
  }
} 