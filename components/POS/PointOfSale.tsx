"use client";

import { Category, Product } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "../ui/button";
import Item from "./Item";
import OrderItem from "./OrderItem";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import SearchItems from "./SearchItems";
import FormSelectInput from "../global/FormInputs/FormSelectInput";
import { createLineOrder } from "@/actions/pos";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { removeAllProductsFromOrderLine } from "@/redux/slices/pointOfSale";
import { ReceiptPrint } from "./ReceiptPrint";

type Customer = {
  label: string;
  value: string;
  email: string;
};

type PointOfSaleProps = {
  categories: Category[];
  products: Product[];
  customers: Customer[];
  selectedCatId: string;
};

export default function PointOfSale({
  categories,
  selectedCatId,
  products,
  customers,
}: PointOfSaleProps) {
  const initialCustomerId = "666679618a65b2eadc3fe772";
  const initialCustomer = customers.find(
    (item: Customer) => item.value === initialCustomerId
  );
  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | undefined>(initialCustomer);
  const [searchResults, setSearchResults] = useState(products);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const orderLineItems = useAppSelector((state) => state.pos.products);
  const subTotal = orderLineItems
    .reduce((total, item) => total + item.price * item.qty, 0)
    ;
  const taxPercent = 10;
  const tax = (taxPercent * Number(subTotal)) / 100;
  const totalSum = (Number(subTotal) + tax).toLocaleString('fr-CM');
  const dispatch = useAppDispatch();

  async function handleCreateOrder() {
    setProcessing(true);
    const customerData = {
      customerId: selectedCustomer?.value as string,
      customerName: selectedCustomer?.label as string,
      customerEmail: selectedCustomer?.email as string,
    };
    const orderItems = orderLineItems;
    const orderAmount = +totalSum;
    const newOrder = {
      orderItems,
      orderAmount,
      orderType: "Sale",
      source: "pos",
    };
    try {
      const res = await createLineOrder(newOrder, customerData);
      if (res) {
        toast.success("Order Created Successfully");
        setSuccess(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setProcessing(false);
    }
  }

  function clearOrder() {
    //Handle Remove From LocalStorage
    dispatch(removeAllProductsFromOrderLine());
    setSuccess(false);
  }

  return (
    <div className="grid grid-cols-12 divide-x-2 divide-gray-200">
      <div className="col-span-full md:col-span-9 px-3">
        <ScrollArea className="w-full whitespace-nowrap rounded-md px-4">
          {categories && categories.length > 0 ? (
            <div className="flex gap-6 items-center py-3 border-b">
              <Button
                variant={selectedCatId === "all" ? "default" : "outline"}
                asChild
              >
                <Link href={`/pos?cat=all`} className="">
                  <h2 className="text-sm">All</h2>
                </Link>
              </Button>
              {categories.map((item) => {
                return (
                  <Button
                    key={item.id}
                    variant={selectedCatId === item.id ? "default" : "outline"}
                    asChild
                  >
                    <Link href={`/pos?cat=${item.id}`} className="">
                      <Image
                        width={200}
                        height={200}
                        alt=""
                        src={item.imageUrl ?? "/placeholder.svg"}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      <h2 className="text-sm">{item.title}</h2>
                    </Link>
                  </Button>
                );
              })}
            </div>
          ) : (
            <div className="">
              <h2>No Categories Found</h2>
            </div>
          )}
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {products && products.length > 0 ? (
          <div className="">
            <div className="grid grid-cols-3">
              <SearchItems data={products} onSearch={setSearchResults} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-6 px-4">
              {searchResults.map((item) => {
                return (
                  item.stockQty > 0 && <Item item={item} key={item.id} />
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-8 flex items-center justify-center">
            <h2>No Products for this Category</h2>
          </div>
        )}
      </div>
      <div className="col-span-full md:col-span-3 px-3">
        <div className="pt-2">
          <FormSelectInput
            label="Customers"
            options={customers}
            option={selectedCustomer}
            setOption={setSelectedCustomer}
            toolTipText="Add New Customer"
            href="/dashboard/sales/customers/new"
          />
        </div>
        {orderLineItems && orderLineItems.length > 0 && (
          <div className="flex items-center justify-between">
            <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0 py-3">
              Order Items
            </h2>
            <Button
              size={"sm"}
              variant={"destructive"}
              className=""
              onClick={clearOrder}
            >
              Clear All
            </Button>
          </div>
        )}
        {orderLineItems && orderLineItems.length > 0 ? (
          <div className="mt-3 space-y-2">
            {orderLineItems.map((item) => {
              return <OrderItem key={item.id} item={item} />;
            })}
          </div>
        ) : (
          <div className="p-4 text-center">
            <h2>No Order Items</h2>
          </div>
        )}
        {orderLineItems && orderLineItems.length > 0 && (
          <div className="">
            <h2 className="scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight first:mt-0 py-3 text-muted-foreground">
              Order Summary
            </h2>
            <div className=" pt-3 px-2 border-b bg-slate-50 rounded">
              <div className="flex items-center justify-between text-sm">
                <p className="text-muted-foreground">Items</p>
                <p className="font-medium">{orderLineItems.length} items</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <p className="text-muted-foreground">Subtotal</p>
                <p className="font-medium">{subTotal.toLocaleString('fr-CM')}</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <p className="text-muted-foreground">Tax</p>
                <p className="font-medium">
                  {taxPercent}% - ({tax.toLocaleString('fr-CM')})
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <h2 className="scroll-m-20 pb-2 text-base font-semibold tracking-tight first:mt-0 py-3 text-muted-foreground">
                Total
              </h2>
              <h2 className="scroll-m-20 pb-2 text-base font-semibold tracking-tight first:mt-0 py-3 text-muted-foreground">
                {totalSum.toLocaleString('fr-CM')} FCFA
              </h2>
            </div>
            {processing ? (
              <Button disabled className="w-full">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Please wait
              </Button>
            ) : (
              <>
                {!success && (
                  <Button onClick={handleCreateOrder} className="w-full">
                    Place Order
                  </Button>
                )}
              </>
            )}
            {success && orderLineItems.length > 0 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant={"outline"}
                  className="w-full"
                  onClick={clearOrder}
                >
                  Clear Order
                </Button>
                <ReceiptPrint setSuccess={setSuccess} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
