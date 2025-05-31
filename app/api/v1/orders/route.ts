import { getAllOrdersPaginated, getOrders } from "@/actions/pos";
import { getAllProducts } from "@/actions/products";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;
    const usePagination = searchParams.get('paginated') === 'true';

    let orders;
    
    if (usePagination) {
      orders = await getAllOrdersPaginated(page, limit);
    } else {
      // Fallback to original function for backward compatibility
      const allOrders = await getOrders();
      orders = {
        orders: allOrders || [],
        totalCount: allOrders?.length || 0,
        totalPages: 1,
        currentPage: 1
      };
    }

    return NextResponse.json(
      {
        data: orders,
        success: true,
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        success: false,
        error,
      },
      { status: 500 }
    );
  }
}
