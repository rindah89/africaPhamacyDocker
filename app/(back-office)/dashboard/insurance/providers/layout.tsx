import AuthorizePageWrapper from "@/components/dashboard/Auth/AuthorizePageWrapper";
import { permissionsObj } from "@/config/permissions";
import React, { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <AuthorizePageWrapper requiredPermission={permissionsObj.canViewInventory}>
      {children}
    </AuthorizePageWrapper>
  );
} 