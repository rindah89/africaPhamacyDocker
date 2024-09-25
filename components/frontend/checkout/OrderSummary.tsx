import Image from "next/image";
import { MoreHorizontal } from "lucide-react";

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
import PreviousButton from "./PreviousButton";
import NextButton from "./NextButton";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import { setActiveStep } from "@/redux/slices/stepSlice";

export default function OrderSummary() {
  const cartItems = useAppSelector((state) => state.cart.cartItems);
  const totalSum = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const activeStep = useAppSelector((state) => state.step.activeStep);
  const dispatch = useAppDispatch();
  function handleSubmit() {
    dispatch(setActiveStep(activeStep + 1));
  }
  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead> Image</TableHead>
                <TableHead>Name</TableHead>

                <TableHead className="hidden md:table-cell">Qty</TableHead>
                <TableHead className="hidden md:table-cell">
                  Sub Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cartItems.map((item) => {
                return (
                  <TableRow key={item.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt={item.name}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={item.image}
                        width="64"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>

                    <TableCell className="hidden md:table-cell">
                      {item.qty}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <p className="font-semibold">{(item.price * item.qty).toLocaleString('fr-CM')} FCFA</p>
                      <p className="text-muted-foreground text-xs">
                        ({item.price.toLocaleString('fr-CM')} FCFA x {item.qty})
                      </p>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="pt-3 w-full border-t flex items-center justify-between">
            <h2 className="text-xl font-semibold">Total</h2>
            <p className="text-xl font-semibold">{totalSum.toLocaleString('fr-CM', { style: 'currency', currency: 'XAF' })}</p>
          </div>
        </CardContent>
        <CardFooter className="">
          <div className=" w-full py-4 flex items-center justify-between">
            <PreviousButton />
            <NextButton />
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
