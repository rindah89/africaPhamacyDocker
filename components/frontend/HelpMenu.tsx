import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Headset,
  HelpCircle,
  LogOut,
  Mail,
  MessageSquareMore,
  PhoneCall,
  Presentation,
  Settings,
  User,
  UserRound,
} from "lucide-react";

import Link from "next/link";

export function HelpMenu() {
  const menuLinks = [
    {
      name: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
    },
    {
      name: "Profile",
      icon: UserRound,
      href: "/dashboard/profile",
    },
    {
      name: "POS",
      icon: Presentation,
      href: "/pos",
    },
  ];
  const assistanceLinks = [
    {
      name: "Free 2 hour set-up assistance",
      icon: Headset,
      href: "/dashboard/settings",
    },
    {
      name: "Chat with Our experts",
      icon: MessageSquareMore,
      href: "/dashboard/profile",
    },
    {
      name: "Send an Email",
      icon: Mail,
      href: "/pos",
    },
    {
      name: "Talk to Us - 237 691 232 678",
      icon: PhoneCall,
      href: "/pos",
    },
  ];
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={"outline"} size={"sm"}>
          <HelpCircle className="w-4 h-4 mr-2" />
          <span>Help</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <h2 className="scroll-m-20 text-xl font-semibold tracking-tight first:mt-0 border-b pb-3">
            Need Help with Our services
          </h2>
          <div className="flex space-x-6 items-center py-6 border-b">
            <Button asChild variant={"outline"}>
              <Link href="/dashboard/account">
                <User className="h-4 w-4 mr-2" />
                <span>Manage Account</span>
              </Link>
            </Button>
            <Button variant={"outline"}>
              <LogOut className="h-4 w-4 mr-2" />
              <span>Logout</span>
            </Button>
          </div>
        </SheetHeader>
        {/* CONTENT HWRE */}
        <div className="">
          <div className="grid grid-cols-3 gap-4 py-6 border-b">
            {menuLinks.map((item, i) => {
              const Icon = item.icon;
              return (
                <Link
                  key={i}
                  href={item.href}
                  className="flex flex-col items-center"
                >
                  <Icon className="w-8 h-8 mr-2" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
          <div className="py-6">
            <h2 className="scroll-m-20 text-xl font-semibold tracking-tight first:mt-0">
              Need Assistance?
            </h2>
            <div className="py-2">
              {assistanceLinks.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Button
                    className=""
                    key={i}
                    size={"sm"}
                    asChild
                    variant={"ghost"}
                  >
                    <Link href={item.href}>
                      <Icon className="h-4 w-4 mr-2" />
                      <span>{item.name}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
        {/* <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter> */}
      </SheetContent>
    </Sheet>
  );
}
