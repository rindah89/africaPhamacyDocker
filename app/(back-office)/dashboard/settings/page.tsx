import * as React from "react";
import AuthorizePageWrapper from "@/components/dashboard/Auth/AuthorizePageWrapper";
import { permissionsObj } from "@/config/permissions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UpdateProfile from "@/components/dashboard/Settings/UpdateProfile";
import { auth } from "@/auth";
import UpdatePassword from "@/components/dashboard/Settings/UpdatePassword";
import ChangePasswordForm from "@/components/frontend/ChangePasswordForm";

export default async function page() {
  const session = await auth();
  return (
    <AuthorizePageWrapper requiredPermission={permissionsObj.canViewSettings}>
      <div>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList>
            <TabsTrigger value="profile">Update Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <UpdateProfile session={session} />
          </TabsContent>
          <TabsContent value="password">
            <UpdatePassword />
          </TabsContent>
        </Tabs>
      </div>
    </AuthorizePageWrapper>
  );
}
