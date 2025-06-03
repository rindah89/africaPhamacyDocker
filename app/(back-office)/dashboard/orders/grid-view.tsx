import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllOrdersPaginated } from "@/actions/pos";
import { convertIsoToDateString } from "@/lib/covertDateToDateString";
import Image from "next/image";
import { Eye, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { generateSlug } from "@/lib/generateSlug";
import { cn } from "@/lib/utils";

export default async function page() {
  console.log("🔄 OrdersGridView: Component starting to render");
  const componentStartTime = Date.now();
  
  try {
    console.log("🔄 OrdersGridView: Calling getAllOrdersPaginated(1, 50)");
    const fetchStartTime = Date.now();
    
    const result = await getAllOrdersPaginated(1, 50);
    
    const fetchTime = Date.now() - fetchStartTime;
    console.log(`✅ OrdersGridView: getAllOrdersPaginated completed in ${fetchTime}ms`);
    
    console.log("📊 OrdersGridView: Raw result inspection:", {
      resultExists: !!result,
      resultType: typeof result,
      isNull: result === null,
      isUndefined: result === undefined,
      hasOrders: result && 'orders' in result,
      ordersIsArray: result && Array.isArray(result.orders),
      ordersLength: result?.orders?.length || 0,
      totalCount: result?.totalCount || 0,
      totalPages: result?.totalPages || 0,
      currentPage: result?.currentPage || 0
    });
    
    const orders = result?.orders || [];
    console.log(`📊 OrdersGridView: Extracted orders array - length: ${orders.length}`);

    if (orders.length > 0) {
      console.log(`📊 OrdersGridView: Sample order inspection:`, {
        firstOrder: {
          id: orders[0]?.id,
          orderNumber: orders[0]?.orderNumber,
          customerName: orders[0]?.customerName,
          lineOrderItems: orders[0]?.lineOrderItems,
          lineItemsLength: orders[0]?.lineOrderItems?.length || 0,
          createdAt: orders[0]?.createdAt
        }
      });
    }

    const actualOrders = orders.filter(
      (order) => order.lineOrderItems && order.lineOrderItems.length > 0
    );
    
    console.log(`📊 OrdersGridView: Filtered orders:`, {
      originalCount: orders.length,
      filteredCount: actualOrders.length,
      filterCriteria: "orders with lineOrderItems.length > 0"
    });
    
    const componentTime = Date.now() - componentStartTime;
    console.log(`✅ OrdersGridView: Component data processing completed in ${componentTime}ms`);
    
    return (
      <div>
        <h2>All Orders</h2>
        <div className="mb-2 text-xs text-gray-500">
          Debug: Found {orders.length} total orders, {actualOrders.length} with items (processed in {componentTime}ms)
        </div>

        <div className="py-8">
          {actualOrders.length > 0 ? (
          <div className="space-y-4">
            {actualOrders.map((order) => {
              const totalSum = order.lineOrderItems.reduce(
                (sum, item) => sum + item.price * item.qty,
                0
              );
              const currentDate = convertIsoToDateString(order.createdAt);
              return (
                <div
                  key={order.id}
                  className={cn(
                    "shadow rounded-md border",
                    order.status === "DELIVERED"
                      ? "border-green-500"
                      : "border-gray-200"
                  )}
                >
                  <div className="pt-4  text-xs">
                    <Table className="text-xs">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order Date</TableHead>
                          <TableHead>Order No</TableHead>
                          <TableHead>P.Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Shipping Address</TableHead>
                          <TableHead>Total Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>{currentDate}</TableCell>
                          <TableCell>#{order.orderNumber}</TableCell>
                          <TableCell>{order.paymentMethod}</TableCell>
                          <TableCell>{order.status}</TableCell>
                          <TableCell>
                            {order.streetAddress}, {order.apartment}
                          </TableCell>
                          <TableCell className="font-semibold text-xl">
                            {totalSum.toLocaleString('fr-CM')} FCFA
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flow-root pb-4 px-8">
                    <ul className="flex items-center space-x-2 justify-between">
                      {order.lineOrderItems.length > 0 &&
                        order.lineOrderItems.map((item, i) => {
                          const slug = generateSlug(item.name);
                          return (
                            <li key={i} className="flex space-x-3">
                              <Link
                                href={`/product/${slug}`}
                                className="flex-shrink-0"
                              >
                                <Image
                                  width={200}
                                  height={200}
                                  className="object-cover w-14 h-14 rounded-lg"
                                  src={item.productThumbnail}
                                  alt={item.name}
                                />
                              </Link>
                            </li>
                          );
                        })}
                      <div className="flex items-center space-x-4">
                        <Button asChild>
                          <Link href={`/dashboard/orders/${order.id}`}>
                            View Order
                          </Link>
                        </Button>
                        <Button variant={"outline"}>Change Status</Button>
                      </div>
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500 mb-4">You haven't received any orders yet.</p>
              <div className="text-sm text-gray-400 mt-4">
                Debug info: {orders.length} total orders fetched, {actualOrders.length} with line items
              </div>
              <Link
                href="/dashboard/orders/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create First Order
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    const errorTime = Date.now() - componentStartTime;
    console.error(`❌ OrdersGridView: Error after ${errorTime}ms:`, error);
    console.error("❌ OrdersGridView: Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return (
      <div className="p-4">
        <div className="text-red-500 text-center">
          <h3>Error Loading Orders (Grid View)</h3>
          <p>There was an issue loading the orders in grid view. Please try refreshing the page.</p>
          <p className="text-sm mt-2">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
          <p className="text-xs mt-1 text-gray-500">Error occurred after {errorTime}ms</p>
        </div>
      </div>
    );
  }
}
