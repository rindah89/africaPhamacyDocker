import Image from "next/image";
import { MoreHorizontal, MoveUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product } from "@prisma/client";
import { SalesProduct } from "@/types/types";
import { formatMoney } from "@/lib/formatMoney";
import Link from "next/link";

export default function BestSellingProducts({
  products,
}: {
  products: SalesProduct[];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="">
            <CardTitle>Best selling Products({products.length})</CardTitle>
            <CardDescription>View the most performing products</CardDescription>
          </div>
          <Button asChild size={"sm"}>
            <Link href="/dashboard/inventory/products">
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
              <TableHead className="hidden w-[100px] sm:table-cell">
                Image
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Price</TableHead>
              <TableHead className="hidden md:table-cell">
                Total Sales
              </TableHead>
              <TableHead className="hidden md:table-cell">
                Total Amount
              </TableHead>
              <TableHead className="hidden md:table-cell">Action</TableHead>
            </TableRow>
          </TableHeader>
          <>
            {products && products.length > 0 ? (
              <TableBody className="">
                {products.map((product) => {
                  const sales = product.sales || [];
                  const totalSales = sales.reduce((acc, item) => {
                    return acc + item.salePrice * item.qty;
                  }, 0);
                  const salesCount = sales.length;
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="hidden sm:table-cell">
                        <Image
                          alt={product.name}
                          className="aspect-square rounded-md object-cover"
                          height="64"
                          src={product.productThumbnail ?? "/placeholder.svg"}
                          width="64"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        ${product.productPrice}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {salesCount}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        ${formatMoney(totalSales)}
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        <Button size={"sm"} variant={"outline"}>
                          <Link href={`/product/${product.slug}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            ) : (
              <TableBody className="">
                <h2>No Products</h2>
              </TableBody>
            )}
          </>
        </Table>
      </CardContent>
    </Card>
  );
}
