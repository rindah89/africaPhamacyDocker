import React from "react";
// import { useSession } from "next-auth/react";

import NotAuthorized from "./NotAuthorized";
import { PermissionKey, permissionsObj } from "@/config/permissions";
import { auth } from "@/auth";

interface PageWrapperProps {
  children: React.ReactNode;
  requiredPermission: PermissionKey;
}

export default async function AuthorizePageWrapper({
  children,
  requiredPermission,
}: PageWrapperProps) {
  const session = await auth();
  const userRole = session?.user?.role;

  // If user role is NOT "customer", allow access to everything
  if (userRole?.roleName !== "customer") {
    return <>{children}</>;
  }

  // For customers, check specific permissions
  if (!userRole || !userRole[requiredPermission]) {
    return <NotAuthorized />;
  }

  return <>{children}</>;
}
