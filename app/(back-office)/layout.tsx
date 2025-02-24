import { getNotifications } from "@/actions/pos";
import Navbar from "@/components/dashboard/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import { authOptions } from "@/config/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login?returnUrl=/dashboard");
  }
  const notifications = (await getNotifications()) || [];
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar session={session} notifications={notifications} />
      <div className="flex flex-col">
        <Navbar session={session} />
        <main className="flex-1 overflow-x-hidden py-4 px-6">{children}</main>
      </div>
    </div>
  );
}
