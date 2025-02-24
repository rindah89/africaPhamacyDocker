"use client";
import React from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Minus, Plus, Trash } from "lucide-react";
import TextArea from "@/components/global/FormInputs/TextArea";
import TextInput from "@/components/global/FormInputs/TextInput";
import { getPurchaseOrderById } from "@/actions/purchases";
import { getNormalDate } from "@/lib/getNormalDate";
import PurchaseOrderStatus from "@/components/frontend/orders/PurchaseOrderStatus";
import { IPurchaseOrder } from "@/types/types";
import { useReactToPrint } from "react-to-print";

export default function PurchaseDetails({
  purchase,
}: {
  purchase: IPurchaseOrder | null | undefined;
}) {
  const componentRef = React.useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  const items = purchase?.items;
  const supplier = purchase?.supplier;
  const totalPrice =
    items?.reduce((acc, item) => acc + item.unitCost * item.quantity, 0) ?? 0;

  return (
    <div>
      <div className="flex justify-between items-center pb-4 border-b ">
        <h2>Purchase Details</h2>
        <Button onClick={handlePrint} size={"sm"} variant={"outline"}>
          Download/Print
        </Button>
      </div>
      <div className="py-3 px-8" ref={componentRef}>
        <div className="py-3 ">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="">
              <h2 className="font-medium pb-3">Supplier Info</h2>
              <p>
                {supplier?.name} - {supplier?.companyName}
              </p>
              <p>{supplier?.email}</p>
              <p>{supplier?.phone}</p>
              <p>
                {supplier?.address} - {supplier?.city}
              </p>
            </div>
            <div className="">
              <h2 className="font-medium pb-3">Company Info</h2>
              <p>Karen Pharmacy</p>
              <p>itsupply@gmail.com</p>
              <p>07853545544</p>
              <p>Kampala william street</p>
            </div>
            <div className="">
              <h2 className="font-medium pb-3">Purchase Info</h2>
              <p>Ref : {purchase?.refNo}</p>
              <div className="flex items-center space-x-2">
                <span className="mr-3">Payment Status : </span>
                <PurchaseOrderStatus order={purchase as IPurchaseOrder} />
              </div>
              <p>
                Purchase Date:{" "}
                {getNormalDate(purchase?.createdAt ?? new Date())}{" "}
              </p>
              <p>Discount : ${purchase?.discount}</p>
            </div>
          </div>
        </div>
        <div className="py-4">
          <h2 className="text-xl font-medium">Order Summary</h2>
          <div className="pt-4">
            <CardContent>
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {/* <TableHead>Product Code</TableHead> */}
                      <TableHead>Name</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <>
                    {items && items.length > 0 ? (
                      <TableBody className="">
                        {items.map((item) => {
                          return (
                            <TableRow key={item.productId}>
                              <TableCell className="font-medium">
                                {item?.productName}
                              </TableCell>
                              <TableCell>{item.currentStock}</TableCell>
                              <TableCell>{item?.unitCost}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{item.subTotal}</TableCell>
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
                <div className="w-full flex items-end justify-end ">
                  <div className="max-w-[200px]  ">
                    <Table>
                      {/* <TableHeader>
                  <TableRow>
                  
                    <TableHead>Item</TableHead>
                    <TableHead >
                      Value
                    </TableHead>
                  </TableRow>
                </TableHeader> */}
                      <TableBody className="">
                        <TableRow>
                          <TableCell className="font-medium">
                            Discount :{" "}
                          </TableCell>
                          <TableCell>{purchase?.discount?.toLocaleString('fr-CM') ?? '0'} FCFA</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Shipping :{" "}
                          </TableCell>
                          <TableCell>{purchase?.shippingCost?.toLocaleString('fr-CM') ?? '0'} FCFA</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-bold">Total : </TableCell>
                          <TableCell>{totalPrice.toLocaleString('fr-CM')} FCFA</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-bold">Paid : </TableCell>
                          <TableCell>
                            {totalPrice - purchase!.balanceAmount}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-bold">
                            Balance :{" "}
                          </TableCell>
                          <TableCell>{purchase!.balanceAmount}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </div>
      </div>
    </div>
  );
}
