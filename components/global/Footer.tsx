import React from "react";
import Logo from "./Logo";
import {
  Copyright,
  Facebook,
  Headset,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import { footer } from "@/config/footer";

export default function Footer() {
  return (
    <footer className="px-10 py-8">
      <div className="container ">
        <div className="grid gap-6 grid-cols-12 border-b border-gray-200 dark:border-gray-700 py-10">
          <div className="col-span-full lg:col-span-4">
            {footer.logo}
            <p className="my-3 text-xs line-clamp-3">{footer.summary}</p>
            <div className="space-y-2">
              {footer.contacts.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-1">
                    <Icon className="w-4 h-4" />
                    <p className="text-xs">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
          {footer.navigation.map((item, i) => {
            return (
              <div key={i} className="col-span-full lg:col-span-2">
                <h2 className="font-semibold text-base">{item.title}</h2>
                <div className="flex flex-col gap-3 py-2">
                  {item.links.map((link, i) => {
                    return (
                      <Link key={i} className="text-xs" href={link.path}>
                        {link.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="py-3 flex justify-between items-center space-y-1 flex-wrap text-xs">
          <div className="flex items-center space-x-2 ">
            <Copyright className="w-5 h-5" />
            <span>{new Date().getFullYear()}</span>
            <span>PantherAI -</span>
            <span>All Rights Reserved</span>
          </div>
         
          
        </div>
      </div>
    </footer>
  );
}
