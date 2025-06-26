import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import React from "react";

const sidebarNavItems = [
  {
    title: "Providers",
    href: "/dashboard/insurance/providers",
  },
  {
    title: "Claims",
    href: "/dashboard/insurance/claims",
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function InsuranceLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="space-y-6 p-2 md:p-10 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Insurance</h2>
        <p className="text-muted-foreground">
          Manage insurance providers and claims in your pharmacy.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
} 