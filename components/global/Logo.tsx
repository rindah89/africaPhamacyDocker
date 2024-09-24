import { cn } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import React from "react";
type LogoProps = {
  labelShown?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
};
export default function Logo({
  labelShown = true,
  size = "md",
  href = "/",
}: LogoProps) {
  return (
    <Link href={href} className="items-center flex gap-2">
      <div
        className={cn(
          "items-center flex justify-center w-9 h-9 rounded-full bg-slate-900 text-slate-50",
          size === "lg" ? "w-12 h-12" : size === "sm" ? "w-7 h-7" : ""
        )}
      >
        <ShoppingBag
          className={cn(
            "w-5 h-5",
            size === "lg" ? "w-7 h-7" : size === "sm" ? "w-4 h-4" : ""
          )}
        />
      </div>
      {labelShown && <h2 className="text-xl font-semibold">MMA</h2>}
    </Link>
  );
}
