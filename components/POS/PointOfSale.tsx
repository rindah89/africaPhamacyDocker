"use client";



import { Category, Product } from "@prisma/client";

import Image from "next/image";

import Link from "next/link";

import React, { useState, useEffect } from "react";

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

  const [searchQuery, setSearchQuery] = useState('');

  const [isSearching, setIsSearching] = useState(false);

  const [searchResults, setSearchResults] = useState(products);

  const [processing, setProcessing] = useState(false);

  const [success, setSuccess] = useState(false);

  const [orderNumber, setOrderNumber] = useState<string>("");

  const [createdOrderId, setCreatedOrderId] = useState<string>("");

  const orderLineItems = useAppSelector((state) => state.pos.products);

  const [barcodeInput, setBarcodeInput] = useState('');

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [orderData, setOrderData] = useState<any>(null);

  const [validatedCustomerData, setValidatedCustomerData] = useState<any>(null);

  const [showReceipt, setShowReceipt] = useState(false);

  const [amountPaid, setAmountPaid] = useState(0);

  

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



  // Add debounced search function

  const handleSearch = async (query: string) => {

    console.log('Search initiated with query:', query);

    setSearchQuery(query);

    

    if (!query.trim()) {

      console.log('Empty query, resetting to all products');

      setSearchResults(products);

      return;

    }



    setIsSearching(true);

    try {

      console.log('Calling searchPOSProducts with query:', query);

      const results = await searchPOSProducts(query);

      console.log('Search results received:', results);

      console.log('Number of results:', results?.length || 0);

      setSearchResults(results);

    } catch (error) {

      console.error('Search error details:', error);

      toast.error('Error searching products');

    } finally {

      setIsSearching(false);

    }

  };



  



  async function handleCreateOrder() {
    console.log('Starting order creation...', {
      selectedCustomer,
      orderLineItems: orderLineItems.length
    });

    if (!selectedCustomer.value) {
      console.log('No customer selected');
      toast.error("Please select a customer");
      return;
    }

    setProcessing(true);
    console.log('Starting order validation...');

    const customer = customers.find(c => c.value === selectedCustomer.value);
    if (!customer) {
      console.log('Selected customer not found', { selectedCustomer });
      toast.error("Selected customer not found");
      setProcessing(false);
      return;
    }

    if (!orderLineItems || orderLineItems.length === 0) {
      console.log('No items in order');
      toast.error("Please add items to the order");
      setProcessing(false);
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
      console.log('Validating order...', { customerData, newOrderData });
      const validationResult = await validateOrder(newOrderData, customerData);
      console.log('Validation result:', validationResult);

      if (validationResult.success) {
        setOrderNumber(validationResult.orderNumber || '');
        setOrderData(newOrderData);
        setValidatedCustomerData(customerData);
        setShowPaymentModal(true);
        console.log('Order validated, showing payment modal', {
          orderNumber: validationResult.orderNumber,
          customerData,
          newOrderData
        });
        toast.success("Order validated successfully");
      } else {
        console.error('Order validation failed:', validationResult.message);
        toast.error(validationResult.message || "Order validation failed");
      }
    } catch (error: any) {
      console.error("Order validation error:", error);
      toast.error(error.message || "Failed to validate order");
    } finally {
      setProcessing(false);
    }
  }

  const handlePaymentComplete = async (result: any) => {
    console.log('Payment completion handler called', result);
    
    if (result.success && result.order) {
      console.log('Setting order details', {
        orderNumber: result.order.orderNumber,
        orderId: result.order.id,
        amountPaid: result.amountPaid
      });

      // Batch state updates to prevent race conditions
      const updates = {
        orderNumber: result.order.orderNumber,
        orderId: result.order.id,
        amountPaid: result.amountPaid || 0,
        showReceipt: true,
        success: true,
        showPaymentModal: false
      };

      // Update all states synchronously
      setOrderNumber(updates.orderNumber);
      setCreatedOrderId(updates.orderId);
      setAmountPaid(updates.amountPaid);
      setShowReceipt(updates.showReceipt);
      setSuccess(updates.success);
      setShowPaymentModal(updates.showPaymentModal);

      console.log('States updated', updates);
    } else {
      console.error('Payment completion failed:', result);
      toast.error('Payment processing failed');
    }
  };

  function clearOrder() {
    console.log('Clearing order', { showReceipt, createdOrderId });
    dispatch(removeAllProductsFromOrderLine());
    setSuccess(false);
    setShowReceipt(false);
    setCreatedOrderId('');
    setOrderNumber('');
    setAmountPaid(0);
    console.log('Order cleared');
  }

  // Memoize the receipt component with stable key
  const receiptKey = React.useMemo(() => 
    createdOrderId ? `receipt-${createdOrderId}` : null
  , [createdOrderId]);

  // Memoize the receipt component
  const receiptComponent = React.useMemo(() => {
    console.log('Evaluating receipt component render', {
      showReceipt,
      itemCount: orderLineItems.length,
      createdOrderId,
      orderNumber,
      receiptKey,
      amountPaid
    });

    if (!showReceipt || !orderLineItems.length || !createdOrderId) {
      console.log('Receipt conditions not met', {
        showReceipt,
        hasItems: orderLineItems.length > 0,
        createdOrderId
      });
      return null;
    }

    console.log('Rendering receipt component', {
      orderNumber,
      createdOrderId,
      customerName: validatedCustomerData?.customerName,
      amountPaid
    });

    return (
      <div key={receiptKey} className="receipt-container">
        <ReceiptPrint2 
          key={`receipt-print-${createdOrderId}`}
          setSuccess={setSuccess} 
          orderNumber={orderNumber}
          orderItems={orderLineItems}
          orderId={createdOrderId}
          customerName={validatedCustomerData?.customerName || ''}
          customerEmail={validatedCustomerData?.customerEmail || ''}
          amountPaid={amountPaid}
        />
      </div>
    );
  }, [showReceipt, orderLineItems, createdOrderId, orderNumber, validatedCustomerData, amountPaid, setSuccess]);

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

                type="text"

                placeholder="Search products..."

                value={searchQuery}

                onChange={(e) => {

                  console.log('Search input changed:', e.target.value);

                  handleSearch(e.target.value);

                }}

                className="w-full"

              />

              <Input

                type="text"

                placeholder="Scan barcode..."

                value={barcodeInput}

                onChange={(e) => setBarcodeInput(e.target.value)}

                onKeyDown={handleBarcodeScan}

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

            {showReceipt && orderLineItems.length > 0 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant={"outline"}
                  className="w-full"
                  onClick={clearOrder}
                >
                  Clear Order
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Render the memoized receipt component */}
      {receiptComponent}

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        totalAmount={subTotal}
        onPaymentComplete={handlePaymentComplete}
        orderData={orderData}
        customerData={validatedCustomerData}
        orderNumber={orderNumber}
      />

    </div>

  );

}

