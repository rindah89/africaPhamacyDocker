import { getAnalytics } from "@/actions/analytics";
import AuthorizePageWrapper from "@/components/dashboard/Auth/AuthorizePageWrapper";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { permissionsObj } from "@/config/permissions";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

export default async function page() {
  return (
    <AuthorizePageWrapper requiredPermission={permissionsObj.canViewDashboard}>
      <div>
        <Suspense fallback={<DashboardSkeleton />}>
          <Dashboard />
        </Suspense>
      </div>
    </AuthorizePageWrapper>
  );
}
