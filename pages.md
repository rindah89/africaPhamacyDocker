//PAGES

NAV BAR

- Quick Access Button
- POS
- Full Screen
- Language
- Avatar (Settings, Profile,Logout)
-

1 - DASHBOARD

- Analytics [Sales,purchases]
- Charts -Top Selling Products (Pie Chart) - Weekly Sales and Purchases (Bar Chart) - Top Clients (Pie Chart)
- Recent Sales (Table)

MODULES

2. USER MANAGEMENT

- Users
- Roles

3. PEOPLE

- Customers
- Suppliers

4. PRODUCTS MANGER

- Variations
- Product
- Labels/Print Barcode
- Category
- Units
- Brand

5. ADJUSTMENT

- Adjustment

6. TRANSFERS

- Transfer

7. QUOTATIONS

- Quotation

8. PURCHASES

- Purchases
- Purchses Return
- Payment Out

9.  SALES

- Sales
- Sales Return
- Payment In
- Quotation

10. RETURNS

- Sales Return
- Purchases Return

11. SETTINGS

- System settings
- Pos Receipt Settings
- SMS Settings
- SMS templates
- Emails templates
- Currency
- Backup
-

12. REPORTS

- Profit and Loss
- Sale Report
- Purchase Report
- Inventory report
- Product report
- Customer Report
- Supplier Report
- Payment sale
- Payment purchase
- Payment sale return
- Payment purchase return
- Product Quantity Alerts
  Reports
  Payments
  Stock Alert
  Sales Summary
  Stock Summary
  Rate List
  Product Sales Summary
  Users Reports
  Expense Reports
  Profit & Loss

13. POS
14. EXPENSES

- Expenses
- Expense Category

15. ONLINE ORDERS

16 FRONT SETTINGS
/////////////////////////////////////////////////////////////////////

SETTING PAGE => STOKIFLY

INVENTORY
-PRODUCTS
SALES
Customers
Sales Orders
Packages
Shipments
Invoices
Sales Receipts
Payments Received
Sales Returns
Credit Notes

PURCHASES
Purchases
Vendors
Purchase Orders
Purchase Receives
Bills
Payments Made
Vendor Credits

INTEGRATIONS

https://clerk.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2F_blog%2Fbuilding-custom-user-profile-with-clerk%2Fpto9t8C.jpg&w=1200&q=75
https://clerk.com/docs/components/user/user-profile

<Link
      href="/cart"
      className="relative inline-flex items-center p-3 text-sm font-medium text-center text-white bg-transparent rounded-lg "
    >
      <ShoppingCart className="text-lime-700 dark:text-lime-500" />
      <span className="sr-only">Cart</span>
      <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500  rounded-full -top-0 end-6 dark:border-gray-900">
        0
      </div>
    </Link>
<!-- LOADING -->
<div className="h-64 w-full bg-gray-300 animate-pulse rounded"></div>
<div className="grid grid-cols-2 gap-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="h-40 bg-gray-300 animate-pulse rounded"></div>
        ))}
      </div>

<!-- ORDER CONFIRMED PAGE INVOICE -->

```
import { getData } from "@/lib/getData";
import { Item } from "@radix-ui/react-dropdown-menu";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default async function page({ params: { id } }) {
  const order = await getData(`orders/${id}`);
  const { orderItems } = order;
  const subTotal = orderItems
    .reduce((acc, item) => acc + item.price * item.quantity, 0)
    .toFixed(2);
  console.log(order);
  return (
    <section className="py-12 dark:bg-slate-950 bg-slate-50 sm:py-16 lg:py-20">
      <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-5xl">
        <div className="max-w-2xl mx-auto">
          <div className="relative mt-6 overflow-hidden bg-white dark:bg-slate-700 rounded-lg shadow md:mt-10">
            <div className="absolute top-4 right-4">
              <Link
                href={`/dashboard/orders/${id}/invoice`}
                className="inline-flex items-center justify-center px-4 py-3 text-xs font-bold text-gray-900 transition-all duration-200 bg-gray-100 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 hover:bg-gray-200"
              >
                View invoice
              </Link>
            </div>

            <div className="px-4 py-6 sm:px-8 sm:py-10">
              <div className="-my-8 divide-y divide-gray-200">
                <div className="pt-16 pb-8 text-center sm:py-8">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-green-500" />

                  <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-green-50">
                    We received your order!
                  </h1>
                  <p className="mt-2 text-sm font-normal text-gray-600 dark:text-slate-300">
                    Your order #{order.orderNumber} is completed and ready to
                    ship
                  </p>
                </div>

                <div className="py-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 sm:gap-x-20">
                    <div>
                      <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
                        Shipping Address
                      </h2>
                      <p className="mt-6 text-sm font-medium text-gray-600 dark:text-gray-300">
                        {order.firstName} {order.lastName}
                      </p>
                      <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                        {order?.apartment}-{order.streetAddress}
                        {order?.state}, {order.city}, {order?.zip},{" "}
                        {order.country}
                      </p>
                    </div>

                    <div>
                      <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
                        Payment Info
                      </h2>
                      <p className="mt-6 text-sm font-medium text-gray-600 dark:text-gray-300">
                        {order.paymentMethod}
                      </p>
                      {/* <p className="mt-1 text-sm font-medium text-gray-600">
                        VISA
                        <br />
                        **** 4660
                      </p> */}
                    </div>
                  </div>
                </div>

                <div className="py-8">
                  <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
                    Order Items
                  </h2>

                  <div className="flow-root mt-8">
                    <ul className="divide-y divide-gray-200 -my-5">
                      {orderItems.length > 0 &&
                        orderItems.map((item, i) => {
                          return (
                            <li
                              key={i}
                              className="flex items-start justify-between space-x-5 py-4 md:items-stretch"
                            >
                              <div className="flex items-stretch">
                                <div className="flex-shrink-0">
                                  <Image
                                    width={200}
                                    height={200}
                                    className="object-cover w-20 h-20 rounded-lg"
                                    src={item.imageUrl}
                                    alt={item.title}
                                  />
                                </div>

                                <div className="flex flex-col justify-between ml-5 w-44">
                                  <p className="flex-1 text-sm font-bold text-gray-900 dark:text-gray-300">
                                    {item.title}
                                  </p>
                                  <p className="text-[13px] font-medium text-gray-500">
                                    $({item.price}x{item.quantity})
                                  </p>
                                </div>
                              </div>

                              <div className="ml-auto">
                                <p className="text-sm font-bold text-right text-gray-900 dark:text-gray-300">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                </div>

                <div className="py-8">
                  <ul className="space-y-4">
                    <li className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Sub total
                      </p>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        ${subTotal}
                      </p>
                    </li>
                    <li className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Shipping Cost
                      </p>
                      <p className="text-[13px] font-medium text-gray-500">
                        The Order will be delivered in{" "}
                        {order.shippingCost == 50
                          ? "3"
                          : order.shippingCost == 75
                          ? "2"
                          : "1"}{" "}
                        days{" "}
                      </p>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        ${parseFloat(order?.shippingCost).toFixed(2)}
                      </p>
                    </li>
                    <li className="flex items-center justify-between">
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        Total
                      </p>
                      <p className="text-base font-bold text-gray-900 dark:text-white">
                        $
                        {(
                          Number(subTotal) + parseFloat(order?.shippingCost)
                        ).toFixed(2)}
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


```
