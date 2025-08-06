import { getOrdersByCustomerId } from "@/actions/orders";
import FormattedAmount from "@/components/frontend/FormattedAmount";
import OrderPagination from "@/components/frontend/orders/OrderPagination";
import OrderStatusBtn from "@/components/frontend/orders/OrderStatusBtn";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { convertIsoToDateString } from "@/lib/covertDateToDateString";
import { generateSlug } from "@/lib/generateSlug";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default async function page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { id } = await params;
  const pageSize = 2;
  const { page = 1 } = searchParams;
  const data = await getOrdersByCustomerId(id, Number(page), pageSize);
  // Create function that fetches products by catSlug,type
  const orders = data?.orders || [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  // console.log(products);
  const startRange = (Number(page) - 1) * pageSize + 1;
  const endRange = Math.min(Number(page) * pageSize, totalCount);
  // const user = awai
  return (
    <div>
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-3xl">
          {orders[0].customerName}
        </h1>
        <div className="text-muted-foreground">
          <p>Email:{orders[0].customerEmail}</p>
          {orders[0].phone && <p>Phone:{orders[0].phone ?? "..."}</p>}
        </div>
      </div>
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">
            Orders({totalCount.toString().padStart(2, "0")})
          </h2>
          <div className="text-xs">
            Showing : {startRange}-{endRange} of {totalCount} orders
          </div>
        </div>
      </div>
      <div className="">
        <div className="pb-8 pt-4">
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => {
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
                        : "border-yellow-500"
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
                            <TableCell>
                              <OrderStatusBtn order={order} />
                            </TableCell>
                            <TableCell>
                              {order.streetAddress},{order.apartment}
                            </TableCell>
                            <TableCell className="font-semibold text-xl">
                              <FormattedAmount
                                amount={order?.orderAmount ?? 0}
                              />
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
                          {/* <Button variant={"outline"}>Change Status</Button> */}
                        </div>
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="">
              <h2>No Orders</h2>
            </div>
          )}
        </div>
        <OrderPagination totalPages={totalPages} />
      </div>
    </div>
  );
}
