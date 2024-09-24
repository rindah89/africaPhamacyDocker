import AuthorizePageWrapper from "@/components/dashboard/Auth/AuthorizePageWrapper";
import { permissionsObj } from "@/config/permissions";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductEndpoints from "@/components/dashboard/Endpoints/ProductEndpoints";
import UsersEndpoints from "@/components/dashboard/Endpoints/UsersEndpoints";
import OrderEndpoints from "@/components/dashboard/Endpoints/OrdersEndpoints";

export default function page() {
  return (
    <AuthorizePageWrapper requiredPermission={permissionsObj.canViewApi}>
      <div className="">
        <Tabs defaultValue="products" className="w-full">
          <TabsList>
            <TabsTrigger value="products">Products API Endpoints</TabsTrigger>
            <TabsTrigger value="users">Users API Endpoints</TabsTrigger>
            <TabsTrigger value="orders">Orders API Endpoints</TabsTrigger>
          </TabsList>
          <TabsContent value="products">
            <ProductEndpoints />
          </TabsContent>
          <TabsContent value="users">
            <UsersEndpoints />
          </TabsContent>
          <TabsContent value="orders">
            <OrderEndpoints />
          </TabsContent>
        </Tabs>
      </div>
    </AuthorizePageWrapper>
  );
}
