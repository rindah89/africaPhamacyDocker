export const dynamic = 'force-dynamic';
import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import React, { Suspense } from "react";
import { columns, OrderWithLineItems } from "./columns";
import { getAllOrdersPaginated, getAllOrdersSimple } from "@/actions/pos";
import Loading from "./loading";
import Link from "next/link";

// Load More Orders Button Component
function LoadMoreButton({ totalCount, currentCount }: { totalCount: number; currentCount: number }) {
  const hasMore = currentCount < totalCount;
  
  if (!hasMore) return null;

  return (
    <div className="flex justify-center mt-6">
      <Link
        href={`/dashboard/orders?limit=${Math.min(currentCount + 100, 1000)}`}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Load More Orders ({totalCount - currentCount} remaining)
      </Link>
    </div>
  );
}

async function OrdersContent({ searchParams }: { searchParams?: Promise<{ limit?: string }> }) {
  let paginatedResult = null;
  let isUsingFallback = false;
  
  // Await searchParams before accessing its properties
  const params = await searchParams;
  
  // Get limit from search params, default to 100 for initial load
  const requestedLimit = params?.limit ? parseInt(params.limit) : 100;
  const limit = Math.min(Math.max(requestedLimit, 1), 1000); // Allow up to 1000 orders
  
  try {
    try {
      paginatedResult = await getAllOrdersPaginated(1, limit);
    } catch (mainError) {
      // Fallback to simple query if main query fails
      paginatedResult = await getAllOrdersSimple(1, limit);
      isUsingFallback = true;
    }
    
    const orders = paginatedResult?.orders || [];
    
    return (
      <>
        {isUsingFallback && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded text-orange-800">
            <strong>Performance Notice:</strong> Using simplified query due to database timeout. 
            Consider optimizing database indexes for better performance.
          </div>
        )}
        
        <TableHeader
          title="Orders"
          linkTitle="Add Order"
          href="/dashboard/orders/new"
          data={orders}
          model="order"
        />
        
        <DataTable<OrderWithLineItems, any> tableTitle="orders" columns={columns} data={orders as OrderWithLineItems[]} />
        
        <LoadMoreButton totalCount={paginatedResult?.totalCount || 0} currentCount={orders.length} />
      </>
    );
  } catch (error) {
    return (
      <div className="p-4">
        <div className="text-red-500 text-center">
          <h3>Error Loading Orders</h3>
          <p>There was an issue loading the orders. Please try refreshing the page.</p>
          <p className="text-sm mt-2">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }
}

export default function page({ searchParams }: { searchParams?: Promise<{ limit?: string }> }) {
  return (
    <div>
      <Suspense fallback={<Loading />}>
        <OrdersContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
