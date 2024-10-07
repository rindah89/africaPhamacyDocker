import { cn } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import React from "react";
import Image from "next/image";
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
          "items-center flex justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-50",
          size === "lg" ? "w-12 h-12" : size === "sm" ? "w-7 h-7" : ""
        )}
      >
        <Image
      src="/PHARMACYICON.ico"
      alt="Pharmacy Icon"
      width={30}
      height={30}
      className={cn(
        "object-contain", // Additional utility classes if needed
        size === "lg" ? "w-7 h-7" : size === "sm" ? "w-4 h-4" : "w-5 h-5"
      )}
    />
      </div>
      {labelShown && <h2 className="text-xl font-semibold">Karen</h2>}
    </Link>
  );
}
