"use client";

import React from "react";
import Logo from "./Logo";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Session } from "next-auth";
import Link from "next/link";
import { getInitials } from "@/lib/generateInitials";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import ModeToggleButton from "./ModeToggleButton";
import { HelpMenu } from "../frontend/HelpMenu";
import { CartMenu } from "../frontend/CartMenu";
import { AlignJustify } from "lucide-react";
import { MobileMenu } from "../frontend/MobileMenu";
import FrontendSearchBar from "../FrontendSearchBar";
export type SearchProduct = {
  name: string;
  slug: string;
  productThumbnail: string;
  type: string;
  id?: string;
};
export default function ShopHeader({
  session,
  products,
}: {
  session: Session | null;
  products: SearchProduct[];
}) {
  const user = session?.user;
  const initials = getInitials(user?.name || "");
  const router = useRouter();
  async function handleLogout() {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <header className="py-3 px-8 border-b border-gray-200 dark:border-gray-700">
      <div className="sm:container max-w-6xl mx-auto">
        {/* Desktopn Version */}
        <nav className="hidden sm:flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="mr-4">
              <Logo href="/" />
            </div>
          </div>
          <div className="flex-1">
            <FrontendSearchBar products={products} />
          </div>
          <div className="flex items-center gap-2 space-x-3">
            <HelpMenu />
            {session && user && user?.id ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="cursor-pointer" asChild>
                  <Avatar>
                    <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem>Billing</DropdownMenuItem> */}
                  {/* <DropdownMenuItem>Team</DropdownMenuItem> */}
                  <DropdownMenuItem>
                    <button onClick={handleLogout}>Logout</button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            )}
            <CartMenu from="header" />
            <ModeToggleButton />
          </div>
        </nav>

        {/* Mobile  Version */}
        <nav className="sm:hidden flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <MobileMenu />
            <div className="">
              <Logo size="sm" href="/" />
            </div>
          </div>
          <CartMenu />
        </nav>
      </div>
    </header>
  );
}
