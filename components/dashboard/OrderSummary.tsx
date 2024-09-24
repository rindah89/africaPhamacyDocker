import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { convertIsoToDateString } from "@/lib/covertDateToDateString";
import { LineOrder } from "@prisma/client";
import { Button } from "../ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MoveUpRight } from "lucide-react";
import { ILineOrder } from "@/types/types";
import OrderStatusBtn from "../frontend/orders/OrderStatusBtn";
import FormattedAmount from "../frontend/FormattedAmount";

export default function OrderSummary({ orders }: { orders: ILineOrder[] }) {
  const actualOrders = orders
    .filter((order) => order.lineOrderItems.length > 0)
    .splice(0, 5);
  return (
    <Card>
      <CardHeader className="px-7">
        <div className="flex justify-between items-center">
          <div className="">
            <CardTitle>Recent Orders({actualOrders.length})</CardTitle>
            <CardDescription>Recent orders from your store.</CardDescription>
          </div>
          <Button asChild size={"sm"}>
            <Link href="/dashboard/orders">
              <span>View All</span>
              <MoveUpRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden sm:table-cell">Source</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="">Amount</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actualOrders &&
              actualOrders.length > 0 &&
              actualOrders.map((item, i) => {
                const date = convertIsoToDateString(item.createdAt);
                const isEven = i % 2 === 0;
                return (
                  <TableRow key={i} className={isEven ? "bg-accent" : ""}>
                    <TableCell>
                      <div className="font-medium">{item.customerName}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        {item.customerEmail}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {item.source}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <OrderStatusBtn order={item} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {date}
                    </TableCell>
                    <TableCell className="text-right">
                      <FormattedAmount amount={item?.orderAmount ?? 0} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant={"outline"} size={"sm"}>
                        <Link href={`/dashboard/orders/${item.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

            {/* <TableRow>
              <TableCell>
                <div className="font-medium">Olivia Smith</div>
                <div className="hidden text-sm text-muted-foreground md:inline">
                  olivia@example.com
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">Refund</TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge className="text-xs" variant="outline">
                  Declined
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">2023-06-24</TableCell>
              <TableCell className="text-right">$150.00</TableCell>
            </TableRow> */}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
