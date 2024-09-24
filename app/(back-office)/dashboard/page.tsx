import { getAnalytics } from "@/actions/analytics";
import AuthorizePageWrapper from "@/components/dashboard/Auth/AuthorizePageWrapper";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { permissionsObj } from "@/config/permissions";
import React from "react";

export default async function page() {
  const analytics = (await getAnalytics()) || [];
  // console.log(analytics);
  return (
    <AuthorizePageWrapper requiredPermission={permissionsObj.canViewDashboard}>
      <div>
        <Dashboard analytics={analytics} />
      </div>
    </AuthorizePageWrapper>
  );
}
