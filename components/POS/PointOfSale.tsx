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

import { addProductToOrderLine, removeAllProductsFromOrderLine } from "@/redux/slices/pointOfSale";

import { ReceiptPrint } from "./ReceiptPrint";

import { Option, Options } from "react-tailwindcss-select/dist/components/type";

import { Input } from "../ui/input";

import ReceiptPrint2 from "./ReceiptPrint2";



type Customer = {

  label: string;

  value: string;

  email: string;

};



interface PointOfSaleProps {

  categories: Category[];

  products: Product[];

  customers: Customer[];

  selectedCatId: string;

}



export default function PointOfSale({

  customers,

  categories,

  products,

  selectedCatId,

}: PointOfSaleProps) {

  const initialCustomerId = "6708677a078944327c4629e5";

  const initialCustomer = customers.find(

    (item: Customer) => item.value === initialCustomerId

  );

  const [selectedCustomer, setSelectedCustomer] = useState<Option>(

    initialCustomer ? { label: initialCustomer.label, value: initialCustomer.value } : { label: "", value: "" }

  );

  const [searchResults, setSearchResults] = useState(products);

  const [processing, setProcessing] = useState(false);

  const [success, setSuccess] = useState(false);

  const [orderNumber, setOrderNumber] = useState<string>("");

  const orderLineItems = useAppSelector((state) => state.pos.products);

  const [barcodeInput, setBarcodeInput] = useState('');

  

  // Raw number calculations for backend

  const subTotal = orderLineItems.reduce((total, item) => total + item.price * item.qty, 0);

  

  // Localized display values

  const totalSumDisplay = (subTotal).toLocaleString('fr-CM'); // For frontend display

  const subTotalDisplay = subTotal.toLocaleString('fr-CM');



  const dispatch = useAppDispatch();



  // Handle barcode scan

  const handleBarcodeScan = (e: React.KeyboardEvent<HTMLInputElement>) => {

    if (e.key === 'Enter') {

      if (!barcodeInput || barcodeInput.trim() === '') {

        toast.error('Please scan or enter a barcode');

        return;

      }

      const scannedProduct = products.find(p => p.productCode === barcodeInput);

      if (scannedProduct) {

        if (scannedProduct.stockQty <= 0) {

          toast.error(`${scannedProduct.name} is out of stock`);

        } else {

          const newOrderLineItem = {

            id: scannedProduct.id,

            name: scannedProduct.name,

            price: scannedProduct.productPrice,

            qty: 1,

            productThumbnail: scannedProduct.productThumbnail,

            stock: scannedProduct.stockQty,

          };

          dispatch(addProductToOrderLine(newOrderLineItem));

          toast.success(`Added ${scannedProduct.name}`);

        }

      } else {

        toast.error(`Invalid barcode: ${barcodeInput} - Product not found`);

      }

      setBarcodeInput(''); // Clear input after scan

    }

  };



  async function handleCreateOrder() {

    if (!selectedCustomer.value) {

      toast.error("Please select a customer");

      return;

    }

    setProcessing(true);
    console.log('Starting order creation...');

    const customer = customers.find(c => c.value === selectedCustomer.value);

    if (!customer) {

      toast.error("Selected customer not found");

      setProcessing(false);

      return;

    }

    if (!orderLineItems || orderLineItems.length === 0) {

      toast.error("Please add items to the order");

      setProcessing(false);

      return;

    }

    const customerData = {

      customerId: customer.value,

      customerName: customer.label,

      customerEmail: customer.email,

    };

    const orderItems = orderLineItems;

    const orderAmount = subTotal;

    console.log('Preparing order with:', {

      customerData,

      orderItems,

      orderAmount

    });

    const newOrder = {

      orderItems,

      orderAmount,

      orderType: "Sale",

      source: "pos",

    };

    try {

      console.log('Calling createLineOrder...');

      const res = await createLineOrder(newOrder, customerData);

      console.log('Order creation response:', res);

      

      if (res) {

        toast.success("Order Created Successfully");

        setSuccess(true);

        setOrderNumber(res.orderNumber || "");

        // Don't clear order items yet, let receipt handle it

      } else {

        toast.error("Order creation failed - no response received");

      }

    } catch (error: any) {

      console.error("Order creation error:", error);

      console.error("Error details:", {

        name: error.name,

        message: error.message,

        stack: error.stack

      });



      // Handle specific error cases

      if (error.message?.includes("timed out") || error.name === "TimeoutError") {

        toast.error("Order creation is taking longer than expected. Please try with fewer items or try again.");

      } else if (error.message?.includes("Insufficient batch quantity")) {

        toast.error(error.message);

      } else if (error.message?.includes("stock")) {

        toast.error(error.message);

      } else if (error.message?.includes("product")) {

        toast.error(error.message);

      } else {

        toast.error("Failed to create order: " + (error.message || "Unknown error"));

      }

    } finally {

      setProcessing(false);

    }

  }



  function clearOrder() {

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

              <SearchItems 
                data={products} 
                onSearch={setSearchResults} 
                onBarcodeScan={(scannedProduct) => {
                  if (scannedProduct) {
                    const newOrderLineItem = {
                      id: scannedProduct.id,
                      name: scannedProduct.name,
                      price: scannedProduct.productPrice,
                      qty: 1,
                      productThumbnail: scannedProduct.productThumbnail,
                      stock: scannedProduct.stockQty,
                    };
                    dispatch(addProductToOrderLine(newOrderLineItem));
                    toast.success(`Added ${scannedProduct.name}`);
                  }
                }} 
              />

            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-6 px-4">
              {searchResults.map((item) => {
                return <Item item={item} key={item.id} />;
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

            options={customers as Options}

            option={selectedCustomer}

            setOption={(option: Option) => setSelectedCustomer(option)}

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

                <p className="font-medium">{subTotalDisplay}</p> {/* Use localized display */}

              </div>

              

            </div>

            <div className="flex items-center justify-between">

              <h2 className="scroll-m-20 pb-2 text-base font-semibold tracking-tight first:mt-0 py-3 text-muted-foreground">

                Total

              </h2>

              <h2 className="scroll-m-20 pb-2 text-base font-semibold tracking-tight first:mt-0 py-3 text-muted-foreground">

                {totalSumDisplay} {/* Use localized display */}

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

                <ReceiptPrint2 
                  setSuccess={setSuccess} 
                  orderNumber={orderNumber}
                  orderItems={orderLineItems}
                />

              </div>

            )}

          </div>

        )}

      </div>

    </div>

  );

}

