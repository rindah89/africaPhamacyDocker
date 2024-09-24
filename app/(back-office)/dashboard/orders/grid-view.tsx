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
import { getOrders } from "@/actions/pos";
import { convertIsoToDateString } from "@/lib/covertDateToDateString";
import Image from "next/image";
import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { generateSlug } from "@/lib/generateSlug";
import { cn } from "@/lib/utils";
export default async function page() {
  const orders = (await getOrders()) || [];

  const actualOrders = orders.filter(
    (order) => order.lineOrderItems.length > 0
  );
  const achievedOrders = orders.filter(
    (order) => order.lineOrderItems.length == 0
  );
  return (
    <div>
      <h2>All Orders</h2>

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
          <div className="">
            <h2>No Orders</h2>
          </div>
        )}
      </div>
    </div>
  );
}
