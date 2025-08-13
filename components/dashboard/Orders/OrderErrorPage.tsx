"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

interface OrderErrorPageProps {
  errorMessage: string;
}

export default function OrderErrorPage({ errorMessage }: OrderErrorPageProps) {
  return (
    <div className="py-8 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Order</h2>
        <p className="text-gray-600 mb-2">There was an error loading this order.</p>
        <p className="text-sm text-gray-500 mb-4">Error: {errorMessage}</p>
        <div className="space-x-4">
          <Link href="/dashboard/orders">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
          <Button 
            onClick={() => window.location.reload()}
            variant="default"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}