import { getOrders } from "@/actions/pos";
import { getAllProducts } from "@/actions/products";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const orders = await getOrders();
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
