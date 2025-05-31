import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import React, { Suspense } from "react";
import { columns } from "./columns";
import { getAllOrdersPaginated, getAllOrdersNoFilter } from "@/actions/pos";
import Loading from "./loading";
import TestOrders from "./test-orders";

async function OrdersContent() {
  try {
    console.log("🔄 Starting to load orders...");
    const startTime = Date.now();
    
    // Try both methods to see if filtering is the issue
    const paginatedResult = await getAllOrdersPaginated(1, 50);
    const allOrdersResult = await getAllOrdersNoFilter();
    
    console.log(`Paginated orders: ${paginatedResult?.orders?.length || 0}`);
    console.log(`All orders (no filter): ${allOrdersResult?.length || 0}`);
    
    // Use whichever gives us results
    const orders = (paginatedResult?.orders && paginatedResult.orders.length > 0 
      ? paginatedResult.orders 
      : allOrdersResult) || [];
    
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
      {/* Temporary debugging component - remove after testing */}
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="text-sm font-medium mb-2">Debug Panel (Remove in production)</h3>
        <TestOrders />
      </div>
      
      <Suspense fallback={<Loading />}>
        <OrdersContent />
      </Suspense>
    </div>
  );
}
