export const dynamic = 'force-dynamic';
import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import React, { Suspense } from "react";
import { columns } from "./columns";
import { getAllOrdersPaginated } from "@/actions/pos";
import Loading from "./loading";

async function OrdersContent() {
  try {
    console.log("🔄 Starting to load orders...");
    const startTime = Date.now();
    
    const paginatedResult = await getAllOrdersPaginated(1, 50); // Default to page 1, limit 50
    
    console.log(`Paginated orders loaded: ${paginatedResult?.orders?.length || 0}`);
    
    const orders = paginatedResult?.orders || [];
    
    const loadTime = Date.now() - startTime;
    console.log(`✅ Orders loaded successfully in ${loadTime}ms. Count: ${orders.length}`);
    
    return (
      <>
        <div className="mb-2 text-xs text-gray-500">
          Loaded {orders.length} orders in {loadTime}ms
        </div>
        <TableHeader
          title="Orders"
          linkTitle="Add Order"
          href="/dashboard/orders/new"
          data={orders}
          model="order"
        />
        <DataTable tableTitle="orders" columns={columns} data={orders} />
      </>
    );
  } catch (error) {
    console.error("❌ Error loading orders:", error);
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

export default function page() {
  return (
    <div>
      
      <Suspense fallback={<Loading />}>
        <OrdersContent />
      </Suspense>
    </div>
  );
}
