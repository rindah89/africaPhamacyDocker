import { authOptions } from "@/config/authOptions";
import { CartItem } from "@/redux/slices/cartSlice";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { products } = await request.json();
    const checkoutProducts: CartItem[] = products;

    const orderId = await saveOrder(userId, checkoutProducts);

    if (orderId) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      const successUrl = `${baseUrl}/order/success?id=${userId}&orderId=${orderId}`;
      
      return NextResponse.json({
        url: successUrl,
      });
    } else {
      throw new Error("Failed to create order");
    }
  } catch (error) {
    console.error("Error processing order:", error);
    return NextResponse.json({ error: "Failed to process order" }, { status: 500 });
  }
}

async function saveOrder(userId: string, products: CartItem[]): Promise<string> {
  // This is a placeholder function
  // Implement your order saving logic here
  // For example, saving to a database and returning an order ID
  console.log("Saving order for user:", userId, "with products:", products);
  
  // Simulating order creation with a random ID
  const orderId = Math.random().toString(36).substring(7);
  
  return orderId;
}