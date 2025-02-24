import React from "react";
import CustomCodeBlock from "./CustomCodeBlock";
import { Button } from "@/components/ui/button";
import { getUsersCount } from "@/actions/analytics";

export default async function UsersEndpoints() {
  const usersCount = await getUsersCount();
  const allUsersCodeString = `
  {
    "success":true,
    "error":null
    "data":[
    {
      "id": "669c2ce12921515b992863a7",
      "email": "kyriacoding2022@gmail.com",
      "firstName": "Marie Madeleine ",
      "lastName": "Kitjel Ndoubha",
      "name": "Marie Madeleine  Kitjel Ndoubha",
      "phone": "00237696014550",
      "profileImage": "https://utfs.io/f/59b606d1-9148-4f50-ae1c-e9d02322e834-2558r.png",
      "inviteSent": false,
      "resetToken": 935228,
      "passwordResetCount": 1,
      "roleId": "666679228a65b2eadc3fe771",
      "status": true,
      "createdAt": "2024-07-20T21:32:17.544Z",
      "updatedAt": "2024-07-20T21:40:49.563Z",
      "role": {
        "id": "666679228a65b2eadc3fe771",
        "displayName": "Customer",
        "roleName": "customer",
        "description": "This a customer",
        "canViewDashboard": false,
        "canViewUsers": false,
        "canViewRoles": false,
        "canViewSales": false,
        "canViewCustomers": false,
        "canViewOrders": false,
        "canViewPos": false,
        "canViewStockTransfer": false,
        "canViewStockAdjustment": false,
        "canViewApi": false,
        "canViewReports": false,
        "canViewSettings": false,
        "canViewMainCategories": false,
        "canViewCategories": false,
        "canViewSubCategories": false,
        "canViewBrands": false,
        "canViewAdverts": false,
        "canViewBanners": false,
        "canViewUnits": false,
        "canViewProducts": false,
        "canViewSuppliers": false,
        "createdAt": "2024-06-10T03:55:14.087Z",
        "updatedAt": "2024-06-10T03:55:14.087Z"
      }
    },
    {
      "id": "6698bc84b05598117668aff4",
      "email": "jicex75667@vasomly.com",
      "firstName": "Abu",
      "lastName": "Shama",
      "name": "Abu Shama",
      "phone": "01983423443",
      "profileImage": "https://utfs.io/f/59b606d1-9148-4f50-ae1c-e9d02322e834-2558r.png",
      "inviteSent": false,
      "resetToken": null,
      "passwordResetCount": 0,
      "roleId": "666679228a65b2eadc3fe771",
      "status": true,
      "createdAt": "2024-07-18T06:56:04.907Z",
      "updatedAt": "2024-07-18T06:56:04.907Z",
      "role": {
        "id": "666679228a65b2eadc3fe771",
        "displayName": "Customer",
        "roleName": "customer",
        "description": "This a customer",
        "canViewDashboard": false,
        "canViewUsers": false,
        "canViewRoles": false,
        "canViewSales": false,
        "canViewCustomers": false,
        "canViewOrders": false,
        "canViewPos": false,
        "canViewStockTransfer": false,
        "canViewStockAdjustment": false,
        "canViewApi": false,
        "canViewReports": false,
        "canViewSettings": false,
        "canViewMainCategories": false,
        "canViewCategories": false,
        "canViewSubCategories": false,
        "canViewBrands": false,
        "canViewAdverts": false,
        "canViewBanners": false,
        "canViewUnits": false,
        "canViewProducts": false,
        "canViewSuppliers": false,
        "createdAt": "2024-06-10T03:55:14.087Z",
        "updatedAt": "2024-06-10T03:55:14.087Z"
      }
    },
    //
    ],
    
  }
  `;
  const singleUserCodeString = `
  {
  "data":  {
    "id": "669c2ce12921515b992863a7",
    "email": "kyriacoding2022@gmail.com",
    "firstName": "Marie Madeleine ",
    "lastName": "Kitjel Ndoubha",
    "name": "Marie Madeleine  Kitjel Ndoubha",
    "phone": "00237696014550",
    "profileImage": "https://utfs.io/f/59b606d1-9148-4f50-ae1c-e9d02322e834-2558r.png",
    "inviteSent": false,
    "resetToken": 935228,
    "passwordResetCount": 1,
    "roleId": "666679228a65b2eadc3fe771",
    "status": true,
    "createdAt": "2024-07-20T21:32:17.544Z",
    "updatedAt": "2024-07-20T21:40:49.563Z"
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
          Get all Users
        </h2>
        <p className="py-3">
          You can access the list of {usersCount} users by using the /users
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
            codeString={`${baseUrl}/users`}
            language="jsx"
            href={`${baseUrl}/users`}
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
            codeString={allUsersCodeString}
            language="jsx"
          />
        </div>
      </div>
      <div className="py-6">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Get a Single User
        </h2>
        <p className="py-3">
          You can get a single user by adding the id as a parameter: /users/id
        </p>
        <Button variant={"outline"}>
          <h3 className="scroll-m-20 text-sm uppercase tracking-widest">
            Request [GET]
          </h3>
        </Button>
        <div className="py-4">
          <CustomCodeBlock
            showLineNumbers={false}
            codeString={`${baseUrl}/users/669c2ce12921515b992863a7`}
            language="jsx"
            href={`${baseUrl}/users/669c2ce12921515b992863a7`}
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
            codeString={singleUserCodeString}
            language="jsx"
          />
        </div>
      </div>
    </div>
  );
}
