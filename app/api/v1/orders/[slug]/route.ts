import { getOrderByNumber } from "@/actions/orders";
import { NextResponse } from "next/server";

type Params = {
  slug: string;
};

export async function GET(request: Request, context: { params: Params }) {
  const orderNumber = context.params.slug;
  
  try {
    const order = await getOrderByNumber(orderNumber);
    
    if (!order) {
      return NextResponse.json(
        {
          data: null,
          success: false,
          error: "Order not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      {
        data: null,
        success: false,
        error: "Failed to fetch order details",
      },
      { status: 500 }
    );
  }
}
