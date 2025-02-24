import React from "react";
import CustomCodeBlock from "./CustomCodeBlock";
import { Button } from "@/components/ui/button";
import { getAllProducts } from "@/actions/products";
import { getOrdersCount, getProductsCount } from "@/actions/analytics";

export default async function OrderEndpoints() {
  const ordersCount = await getOrdersCount();
  const allProductsCodeString = `
  {
    "success":true,
    "error":null
    "data":[
    {
      "id": "668ff80f8801bd7b9486ff76",
      "customerId": "666679618a65b2eadc3fe772",
      "customerName": "Walk In Customer",
      "orderNumber": "D6V3WGVK",
      "customerEmail": "pywomugub@mailinator.com",
      "orderAmount": 8250000,
      "orderType": "Sale",
      "source": "pos",
      "status": "DELIVERED",
      "firstName": null,
      "lastName": null,
      "email": null,
      "phone": null,
      "streetAddress": null,
      "city": null,
      "country": null,
      "apartment": null,
      "state": null,
      "zipCode": null,
      "paymentMethod": null,
      "createdAt": "2024-07-11T15:19:42.017Z",
      "updatedAt": "2024-07-11T15:19:42.017Z",
      "lineOrderItems": [
        {
          "id": "668ff8108801bd7b9486ff77",
          "productId": "66700c111f845c6fdc9ad1c9",
          "orderId": "668ff80f8801bd7b9486ff76",
          "name": "HP Stream 11 Pro G4 - 11\" - Intel Celeron - Dual Core - 64GB HDD - 4GB RAM - Windows 10+ Gifts",
          "price": 2500000,
          "qty": 1,
          "productThumbnail": "https://utfs.io/f/4331d814-3eba-4a8c-a956-c506a211b644-tm9vv5.webp",
          "createdAt": "2024-07-11T15:19:42.017Z",
          "updatedAt": "2024-07-11T15:19:42.017Z"
        },
        {
          "id": "668ff8118801bd7b9486ff79",
          "productId": "66700a4ba6eeb3b691452f6f",
          "orderId": "668ff80f8801bd7b9486ff76",
          "name": "HP Probook X360 11 Intel Pentium Touchscreen 265GB SSD - 4GB RAM + 32GB Flash Mouse",
          "price": 2500000,
          "qty": 1,
          "productThumbnail": "https://utfs.io/f/23bc3e7b-d93b-45e1-b9be-92990e21936d-hnbzic.jpg",
          "createdAt": "2024-07-11T15:19:42.017Z",
          "updatedAt": "2024-07-11T15:19:42.017Z"
        },
        {
          "id": "668ff8128801bd7b9486ff7b",
          "productId": "6670090da6eeb3b691452f6e",
          "orderId": "668ff80f8801bd7b9486ff76",
          "name": "Dell Latitude  3190 2 in 1 X360 Intel Pentium ",
          "price": 2500000,
          "qty": 1,
          "productThumbnail": "https://utfs.io/f/78fd14a2-a9bc-4006-a87f-3c23a94bdf10-1u08x.webp",
          "createdAt": "2024-07-11T15:19:42.017Z",
          "updatedAt": "2024-07-11T15:19:42.017Z"
        }
      ]
    },
    //
    ],
    
  }
  `;
  const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1`;

  return (
    <div className="space-y-8">
      <div className="py-6">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Get all Orders
        </h2>
        <p className="py-3">
          You can access the list of {ordersCount} orders by using the /orders
          endpoint.
        </p>
        <Button variant={"outline"}>
          <h3 className="scroll-m-20 text-sm uppercase tracking-widest">
            Request [GET]
          </h3>
        </Button>
        <div className="py-4">
          <CustomCodeBlock
            showLineNumbers={false}
            codeString={`${baseUrl}/orders`}
            language="jsx"
            href={`${baseUrl}/orders`}
          />
        </div>
        <div className="py-3">
          <div className="pb-3">
            <Button variant={"outline"}>
              <h3 className="scroll-m-20 text-sm uppercase tracking-widest">
                Response [JSON]
              </h3>
            </Button>
          </div>
          <CustomCodeBlock
            showLineNumbers={true}
            codeString={allProductsCodeString}
            language="jsx"
          />
        </div>
      </div>
    </div>
  );
}
