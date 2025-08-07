import Sidebar from "@/components/POS/Sidebar";
import Navbar from "@/components/dashboard/Navbar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Africa Pharmacy POS",
  description: "Africa Pharmacy Point of Sale",
  alternates: {
    canonical: "/pos",
    languages: {
      "en-US": "/en-US",
    },
  },
};
export default async function Layout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar session={session} />
      <div className="flex flex-col sm:py-4 sm:pl-14">
        <Navbar session={session} />
        <main className="">{children}</main>
      </div>
    </div>
  );
}
