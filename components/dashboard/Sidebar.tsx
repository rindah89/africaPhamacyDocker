"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Plus,
  Power,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Logo from "../global/Logo";
import { sidebarLinks } from "@/config/sidebar";
import { Session } from "next-auth";
import { filterLinks } from "@/lib/filterLinks";
import { signOut } from "next-auth/react";
import { NotificationMenu } from "../frontend/NotificationMenu";
import { Notification } from "@prisma/client";

export default function Sidebar({
  session,
  notifications,
}: {
  session: Session;
  notifications: Notification[];
}) {
  const router = useRouter();
  async function handleLogout() {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  }
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );
  const pathname = usePathname();
  const user = session.user;
  const filteredLinks = filterLinks(sidebarLinks, user);

  // console.log(filteredLinks);
  // console.log(user);
  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex flex-shrink-0 h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Logo href="/dashboard" />

          <NotificationMenu notifications={notifications} />
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {filteredLinks.map((item, i) => {
              const Icon = item.icon;
              const isHrefIncluded =
                item.dropdownMenu &&
                item.dropdownMenu.some((link) => link.href === pathname);

              const isOpen = openDropdownIndex === i;

              return (
                <div key={i}>
                  {item.dropdown ? (
                    <Collapsible open={isOpen}>
                      <CollapsibleTrigger
                        onClick={() => setOpenDropdownIndex(isOpen ? null : i)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary  w-full",
                          isHrefIncluded && "bg-muted text-primary"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.title}
                        {isOpen ? (
                          <ChevronDown className=" h-5 w-5 ml-auto flex shrink-0 items-center justify-center rounded-full" />
                        ) : (
                          <ChevronRight className=" h-5 w-5 ml-auto flex shrink-0 items-center justify-center rounded-full" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="dark:bg-slate-950 rounded mt-1">
                        {item.dropdownMenu &&
                          item.dropdownMenu.map((item, i) => {
                            return (
                              <Link
                                key={i}
                                href={item.href}
                                className={cn(
                                  "mx-4 flex items-center gap-3 rounded-lg px-3 py-1 text-muted-foreground transition-all hover:text-primary justify-between text-xs ml-6",
                                  pathname === item.href &&
                                    "bg-muted text-primary"
                                )}
                              >
                                {item.title}
                                <span className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                                  <Plus className="w-4 h-4" />
                                </span>
                              </Link>
                            );
                          })}
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <Link
                      href={item.href ?? "#"}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                        pathname === item.href && "bg-muted text-primary"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  )}
                </div>
              );
            })}
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              target="_blank"
            >
              <ExternalLink className="h-4 w-4" />
              Live Website
            </Link>
          </nav>
        </div>

        <div className="mt-auto p-4">
          <Button onClick={handleLogout} size="sm" className="w-full">
            <Power className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
