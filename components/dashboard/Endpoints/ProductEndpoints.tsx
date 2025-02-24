import React from "react";
import CustomCodeBlock from "./CustomCodeBlock";
import { Button } from "@/components/ui/button";
import { getAllProducts } from "@/actions/products";
import { getProductsCount } from "@/actions/analytics";

export default async function ProductEndpoints() {
  const productsCount = await getProductsCount();
  const allProductsCodeString = `
  {
    "success":true,
    "error":null
    "data":[
    {
      "id": "667ce87f0c413652ea95cd31",
      "name": "5ft Office Table With 3ft Extension",
      "slug": "5ft-office-table-with-3ft-extension",
      "productCode": "147642834",
      "stockQty": 98,
      "productCost": 100,
      "productPrice": 200,
      "alertQty": 10,
      "productTax": 5,
      "taxMethod": "inclusive",
      "productImages": [
        "https://utfs.io/f/ea7f2510-97a3-4eee-b4ff-f64dad0a9e4a-p0mwdf.jpg",
        "https://utfs.io/f/77deeb48-ceb8-4702-b9ad-b2b03881aaec-n83ahj.jpg"
      ],
      "status": true,
      "productThumbnail": "https://utfs.io/f/ea7f2510-97a3-4eee-b4ff-f64dad0a9e4a-p0mwdf.jpg",
      "productDetails": " 5 feet desk and 3 feet extension suitable for middle managers/Supervisors",
      "content": "<h3>Product Details</h3><p>This is the best table i have ever used , it really nice</p><ul class=\"novel-list-disc novel-list-outside novel-leading-3 novel--mt-2 tight\" data-tight=\"true\"><li class=\"novel-leading-normal novel--mb-2\"><p>Portable</p></li><li class=\"novel-leading-normal novel--mb-2\"><p>Cost effective</p></li><li class=\"novel-leading-normal novel--mb-2\"><p>Versatile and durable</p></li></ul>",
      "batchNumber": "929",
      "expiryDate": "2024-06-27T00:00:00.000Z",
      "isFeatured": true,
      "createdAt": "2024-06-27T04:20:15.669Z",
      "updatedAt": "2024-07-08T04:22:33.235Z",
      "subCategoryId": "6670057f9c0ce14ce01842df",
      "brandId": "66457757076904eae2e8ffa0",
      "unitId": "6646e2e392c89096283cb593",
      "supplierId": "6646d95d92c89096283cb58b",
      "subCategory": {
        "id": "6670057f9c0ce14ce01842df",
        "title": "Office and Business ",
        "slug": "office-and-business-",
        "categoryId": "66700548a6eeb3b691452f6d",
        "createdAt": "2024-06-17T09:44:31.786Z",
        "updatedAt": "2024-06-17T09:44:31.786Z"
      }
    },
    //
    ],
    
  }
  `;
  const singleProductCodeString = `
  {
  "data": {
    "id": "6672eef51bcced65d52dc85f",
    "name": "Apple iPhone 15 Pro 512GB Blue Titanium",
    "slug": "apple-iphone-15-pro-512gb-blue-titanium",
    "productCode": "527079499",
    "stockQty": 93,
    "productCost": 100,
    "productPrice": 200,
    "alertQty": 10,
    "productTax": 10,
    "taxMethod": "inclusive",
    "productImages": [
      "https://utfs.io/f/b8cb738b-e5f9-42f7-a576-884f8ac74729-w8nlx7.jpg"
    ],
    "status": true,
    "productThumbnail": "https://utfs.io/f/b8cb738b-e5f9-42f7-a576-884f8ac74729-w8nlx7.jpg",
    "productDetails": "Dimensions 147.6 x 71.6 x 7.8 mm (5.81 x 2.82 x 0.31 in)\nWeight 171 g (6.03 oz)\nBuild Glass front (Corning-made glass), glass back (Corning-made glass), aluminum frame\n\n",
    "content": null,
    "batchNumber": "643",
    "expiryDate": "2024-06-19T00:00:00.000Z",
    "isFeatured": true,
    "createdAt": "2024-06-19T14:45:09.021Z",
    "updatedAt": "2024-07-08T04:22:33.235Z",
    "subCategoryId": "6672edd4046b0c9f08e3e62c",
    "brandId": "66664c9db1b9c7267fde0419",
    "unitId": "6646e2e392c89096283cb593",
    "supplierId": "6646d95d92c89096283cb58c",
    "subCategory": {
      "id": "6672edd4046b0c9f08e3e62c",
      "title": "Smart Phones",
      "slug": "smart-phones",
      "categoryId": "66725a42a23c0e0d0389c68f",
      "createdAt": "2024-06-19T14:40:20.154Z",
      "updatedAt": "2024-06-19T14:40:20.154Z",
      "category": {
        "id": "66725a42a23c0e0d0389c68f",
        "title": "Mobile Phones",
        "slug": "mobile-phones",
        "description": "These are Mobile Phones",
        "imageUrl": "https://utfs.io/f/ba478c80-007d-4340-9b14-c24eb927d4db-jlo1ag.jpg",
        "status": true,
        "mainCategoryId": "666d1c6b17664964a677d398",
        "createdAt": "2024-06-19T04:10:42.556Z",
        "updatedAt": "2024-06-19T04:10:42.556Z",
        "mainCategory": {
          "id": "666d1c6b17664964a677d398",
          "title": "Phone and Tablets",
          "slug": "phone-and-tablets",
          "createdAt": "2024-06-15T04:45:31.512Z",
          "updatedAt": "2024-06-15T04:45:31.512Z"
        }
      }
    },
    "brand": {
      "id": "66664c9db1b9c7267fde0419",
      "title": "HP",
      "slug": "hp",
      "status": true,
      "logo": "https://utfs.io/f/ceba64e1-33b6-47b0-8b76-f839ff610c1d-7aw30t.jpeg",
      "createdAt": "2024-06-10T00:45:17.243Z",
      "updatedAt": "2024-06-10T00:45:17.243Z"
    }
  },
  "success": true,
  "error": null
}
  `;
  const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1`;

  return (
    <div className="space-y-8">
      <div className="py-6">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Get all products
        </h2>
        <p className="py-3">
          You can access the list of {productsCount} products by using the
          /products endpoint.
        </p>
        <Button variant={"outline"}>
          <h3 className="scroll-m-20 text-sm uppercase tracking-widest">
            Request [GET]
          </h3>
        </Button>
        <div className="py-4">
          <CustomCodeBlock
            showLineNumbers={false}
            codeString={`${baseUrl}/products`}
            language="jsx"
            href={`${baseUrl}/products`}
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
      <div className="py-6">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Get a Single Product
        </h2>
        <p className="py-3">
          You can get a single product by adding the slug as a parameter:
          /products/slug
        </p>
        <Button variant={"outline"}>
          <h3 className="scroll-m-20 text-sm uppercase tracking-widest">
            Request [GET]
          </h3>
        </Button>
        <div className="py-4">
          <CustomCodeBlock
            showLineNumbers={false}
            codeString={`${baseUrl}/products/apple-iphone-15-pro-512gb-blue-titanium`}
            language="jsx"
            href={`${baseUrl}/products/apple-iphone-15-pro-512gb-blue-titanium`}
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
            codeString={singleProductCodeString}
            language="jsx"
          />
        </div>
      </div>
    </div>
  );
}
