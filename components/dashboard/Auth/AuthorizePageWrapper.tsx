import React from "react";
// import { useSession } from "next-auth/react";

import NotAuthorized from "./NotAuthorized";
import { PermissionKey, permissionsObj } from "@/config/permissions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/authOptions";

interface PageWrapperProps {
  children: React.ReactNode;
  requiredPermission: PermissionKey;
}

export default async function AuthorizePageWrapper({
  children,
  requiredPermission,
}: PageWrapperProps) {
  const session = await getServerSession(authOptions);
  const userPermissions = session?.user?.role;

  if (!userPermissions || !userPermissions[requiredPermission]) {
    return <NotAuthorized />;
  }

  return <>{children}</>;
}
