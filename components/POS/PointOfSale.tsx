"use client";



import { Category, Product } from "@prisma/client";

import Image from "next/image";

import Link from "next/link";

import React, { useState, useEffect, useRef } from "react";

import { Button } from "../ui/button";

import Item from "./Item";

import OrderItem from "./OrderItem";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";

import SearchItems from "./SearchItems";

import FormSelectInput from "../global/FormInputs/FormSelectInput";

import { createLineOrder, validateOrder } from "@/actions/pos";

import { Loader2 } from "lucide-react";

import toast from "react-hot-toast";

import { addProductToOrderLine, removeAllProductsFromOrderLine } from "@/redux/slices/pointOfSale";

import { ReceiptPrint } from "./ReceiptPrint";

import { Option, Options } from "react-tailwindcss-select/dist/components/type";

import { Input } from "../ui/input";

import ReceiptPrint2 from "./ReceiptPrint2";

import PaymentModal from "./PaymentModal";

import { searchPOSProducts } from "@/actions/products";

import BarcodeScanner, { BarcodeScannerRef } from "./BarcodeScanner";

import KeyboardShortcuts from "./KeyboardShortcuts";



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

  

  type SaleState = 'idle' | 'creating_order' | 'taking_payment' | 'payment_success';
  const [saleState, setSaleState] = useState<SaleState>('idle');

  useEffect(() => {
    // State change tracking
  }, [saleState]);

  const [selectedCustomer, setSelectedCustomer] = useState<Option>(

    initialCustomer ? { label: initialCustomer.label, value: initialCustomer.value } : { label: "", value: "" }

  );

  const [searchQuery, setSearchQuery] = useState('');

  const [isSearching, setIsSearching] = useState(false);

  const [searchResults, setSearchResults] = useState(products);

  const [orderNumber, setOrderNumber] = useState<string>("");

  const [createdOrderId, setCreatedOrderId] = useState<string>("");



  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [orderData, setOrderData] = useState<any>(null);

  const [validatedCustomerData, setValidatedCustomerData] = useState<any>(null);

  const [amountPaid, setAmountPaid] = useState<number>(0);

  const [receiptKey, setReceiptKey] = useState<number>(0);

  const [insuranceData, setInsuranceData] = useState<{
    providerId: string;
    providerName: string;
    percentage: number;
    insuranceAmount: number;
    customerAmount: number;
    customerName: string;
    policyNumber: string;
  } | null>(null);

  

  // Refs for keyboard shortcuts
  const searchInputRef = useRef<HTMLInputElement>(null);
  const barcodeScannerRef = useRef<BarcodeScannerRef>(null);

  const dispatch = useAppDispatch();

  

  // Get orderLineItems from Redux store

  const orderLineItems = useAppSelector((state) => state.pos.products);

  

  // Raw number calculations for backend - after orderLineItems is defined

  const subTotal = orderLineItems.reduce((total, item) => total + item.price * item.qty, 0);

  

  // Localized display values - after subTotal is calculated

  const totalSumDisplay = (subTotal).toLocaleString('fr-CM');

  const subTotalDisplay = subTotal.toLocaleString('fr-CM');



  // Handle product scanned from barcode scanner
  const handleProductScanned = (product: Product) => {
    const newOrderLineItem = {
      id: product.id,
      name: product.name,
      price: product.productPrice,
      qty: 1,
      productThumbnail: product.productThumbnail,
      stock: product.stockQty,
    };
    dispatch(addProductToOrderLine(newOrderLineItem));
  };

  // Keyboard shortcut handlers
  const handleFocusBarcode = () => {
    if (barcodeScannerRef.current?.focusInput) {
      barcodeScannerRef.current.focusInput();
    }
  };

  const handleFocusSearch = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };



  // Add debounced search function

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults(products);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchPOSProducts(query);
      setSearchResults(results);

    } catch (error) {

      console.error('Search error details:', error);

      toast.error('Error searching products');

    } finally {

      setIsSearching(false);

    }

  };



  



  async function handleCreateOrder() {
    if (saleState !== 'idle') {
      return;
    }

    if (!selectedCustomer.value) {
      toast.error("Please select a customer");
      return;
    }

    setSaleState('creating_order');

    const customer = customers.find(c => c.value === selectedCustomer.value);
    if (!customer) {
      console.error(`[Create Order] Failed: Customer not found for ID ${selectedCustomer.value}`);
      toast.error("Selected customer not found");
      setSaleState('idle');
      return;
    }

    if (!orderLineItems || orderLineItems.length === 0) {
      console.error('[Create Order] Failed: No items in order.');
      toast.error("Please add items to the order");
      setSaleState('idle');
      return;
    }

    const customerData = {
      customerId: customer.value,
      customerName: customer.label,
      customerEmail: customer.email,
    };

    const newOrderData = {
      orderItems: orderLineItems,
      orderAmount: subTotal,
      orderType: "Sale",
      source: "pos",
    };

    try {
      console.log('[Create Order] Calling validateOrder API...', { customerData, newOrderData });
      const validationResult = await validateOrder(newOrderData, customerData);
      console.log('[Create Order] API Response:', validationResult);

      if (validationResult.success) {
        setOrderNumber(validationResult.orderNumber || '');
        setOrderData(newOrderData);
        setValidatedCustomerData(customerData);
        console.log(`[Create Order] Success! Transitioning state: creating_order -> taking_payment`);
        setSaleState('taking_payment');
        toast.success("Order validated successfully");
      } else {
        console.error('[Create Order] API validation failed:', validationResult.message);
        toast.error(validationResult.message || "Order validation failed");
        setSaleState('idle');
      }
    } catch (error: any) {
      console.error('[Create Order] API call threw an error:', error);
      toast.error(error.message || "Failed to validate order");
      setSaleState('idle');
    }
  }

  const handlePaymentComplete = async (result: any) => {
    console.log('[Payment Complete] Received result:', result);
    if (result.success) {
      console.log('[Payment Complete] Payment was successful. Preparing for receipt...');
      setAmountPaid(result.amountPaid);
      setOrderNumber(result.orderNumber);
      setInsuranceData(result.insurance || null);
      setReceiptKey(prev => prev + 1);
      console.log(`[Payment Complete] Transitioning state: taking_payment -> payment_success`);
      setSaleState('payment_success');
    } else {
      console.error('[Payment Complete] Payment failed. Resetting state.');
      toast.error("Payment processing failed. Please try again.");
      setSaleState('idle');
    }
  };

  function clearOrder() {
    console.log(`[Clear Order] Clearing order state. Current state: ${saleState}`);
    dispatch(removeAllProductsFromOrderLine());
    setSaleState('idle');
    setOrderNumber('');
    setAmountPaid(0);
    setInsuranceData(null);
    setValidatedCustomerData(null);
    setOrderData(null);
    console.log('[Clear Order] Order state cleared. New state: idle');
  }

  console.log(`[Render] Component rendering with state: ${saleState}`);
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

            <div className="flex gap-2 p-4">

              <Input

                ref={searchInputRef}

                type="text"

                placeholder="Search products..."

                value={searchQuery}

                onChange={(e) => {

                  console.log('Search input changed:', e.target.value);

                  handleSearch(e.target.value);

                }}

                className="w-full"

              />

            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">

              {isSearching ? (

                <div className="col-span-full flex justify-center">

                  <Loader2 className="h-8 w-8 animate-spin" />

                </div>

              ) : searchResults?.length > 0 ? (

                searchResults.map((product) => {

                  

                  return <Item key={product.id} item={product} />;

                })

              ) : (

                <div className="col-span-full text-center text-gray-500">

                  No products found

                </div>

              )}

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

        

        {/* Barcode Scanner Component */}

        <div className="pt-4">

          <BarcodeScanner

            ref={barcodeScannerRef}

            products={products}

            onProductScanned={handleProductScanned}

            className="mb-4"

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

            {saleState === 'creating_order' ? (
              <Button disabled className="w-full">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Please wait
              </Button>
            ) : (
              <Button onClick={handleCreateOrder} className="w-full" disabled={saleState !== 'idle'}>
                Place Order
              </Button>
            )}

          </div>
        )}
      </div>

      {saleState === 'payment_success' && orderLineItems.length > 0 && (
        <ReceiptPrint2 
          key={receiptKey}
          isOpen={saleState === 'payment_success'}
          onClose={clearOrder}
          orderItems={orderLineItems}
          customerName={validatedCustomerData?.customerName || ''}
          customerEmail={validatedCustomerData?.customerEmail || ''}
          amountPaid={amountPaid}
          orderData={orderData}
          customerData={validatedCustomerData}
          orderNumber={orderNumber}
          insuranceData={insuranceData}
        />
      )}

      <PaymentModal
        isOpen={saleState === 'taking_payment'}
        onClose={() => {
          console.log('[Payment Modal] Closed without completion.');
          setSaleState('idle');
        }}
        totalAmount={subTotal}
        onPaymentComplete={handlePaymentComplete}
        orderData={orderData}
        customerData={validatedCustomerData}
        orderNumber={orderNumber}
      />

      <KeyboardShortcuts
        onFocusBarcode={handleFocusBarcode}
        onFocusSearch={handleFocusSearch}
        onClearOrder={clearOrder}
        onPlaceOrder={handleCreateOrder}
        canPlaceOrder={orderLineItems.length > 0 && saleState === 'idle'}
      />

    </div>

  );

}

