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
  AlignJustify,
  ChevronRight,
  Headset,
  HelpCircle,
  LogOut,
  Mail,
  MapIcon,
  MapPin,
  MessageSquareMore,
  PhoneCall,
  Presentation,
  Settings,
  User,
  UserRound,
} from "lucide-react";

import Link from "next/link";
import Logo from "../global/Logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { HelpMenu } from "./HelpMenu";

const tags = Array.from({ length: 10 }).map(
  (_, i, a) => `Category.${a.length - i}`
);
export function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size={"icon"} variant={"ghost"}>
          <AlignJustify className="w-6 h-6 " />
        </Button>
      </SheetTrigger>
      <SheetContent side={"left"}>
        <SheetHeader>
          <div className="pb-2 border-b">
            <Logo href="/" size="sm" />
          </div>
        </SheetHeader>
        <ScrollArea className="h-[450px] w-full rounded-md ">
          <div className="p-4">
            <div className="flex justify-between space-x-3 pb-4 mb-4 border-b">
              <Button className="w-full" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button className="w-full" variant={"outline"} asChild>
                <Link href="/register">Signup</Link>
              </Button>
            </div>
            <div className="flex justify-between space-x-3 mb-4 border-b pb-3">
              <Link href="/login" className="flex items-center space-x-2">
                <MapPin className="w-6 h-6 flex-shrink-0 text-muted-foreground" />
                <div className="">
                  <span>Track Orders</span>
                  <p className="text-muted-foreground text-xs">
                    View Order status
                  </p>
                </div>
              </Link>
              <HelpMenu />
            </div>
            <h4 className="mb-4 border-b font-semibold leading-none text-xl pb-2">
              Categories
            </h4>
            {tags.map((tag, i) => (
              <Link href="" key={i}>
                <div className="flex items-center justify-between">
                  <div key={tag} className="text-sm">
                    {tag}
                  </div>
                  <ChevronRight className="w-6 h-6 text-muted-foreground" />
                </div>
                <Separator className="my-2" />
              </Link>
            ))}
            <div className="flex justify-between space-x-3  ">
              <Button className="w-full" asChild>
                <Link href="tel:256784143872">Call Us</Link>
              </Button>
              <Button className="w-full" variant={"outline"} asChild>
                <Link href="/chat">Chat with Us</Link>
              </Button>
            </div>
          </div>
        </ScrollArea>
        {/* <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter> */}
      </SheetContent>
    </Sheet>
  );
}
