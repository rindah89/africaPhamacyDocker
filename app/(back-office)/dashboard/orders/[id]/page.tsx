import { getOrderById } from "@/actions/orders";
import OrderInvoice from "@/components/frontend/orders/OrderInvoice";
import OrderErrorPage from "@/components/dashboard/Orders/OrderErrorPage";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    console.log(`Loading order page for id: ${id}`);
    
    // Validate ID format
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return (
        <div className="py-8 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Order ID</h2>
            <p className="text-gray-600 mb-4">The order ID provided is invalid.</p>
            <Link href="/dashboard/orders">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Button>
            </Link>
          </div>
        </div>
      );
    }
    
    const order = await getOrderById(id);

    return (
      <div>
        <div className="mb-4 px-4">
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
        </div>
        
        {order ? (
          <OrderInvoice order={order} />
        ) : (
          <div className="py-8 px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h2>
              <p className="text-gray-600 mb-2">No order found with ID: {id}</p>
              <p className="text-sm text-gray-500 mb-4">The order may have been deleted or the ID may be incorrect.</p>
              <Link href="/dashboard/orders">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Orders
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading order page:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return <OrderErrorPage errorMessage={errorMessage} />;
  }
}
