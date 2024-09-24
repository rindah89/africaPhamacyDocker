import { formatMoney } from "@/lib/formatMoney";
import { cn } from "@/lib/utils";
import React from "react";

export default function FormattedAmount({
  amount,
  className,
  showSymbol = true,
}: {
  amount: number;
  className?: string;
  showSymbol?: boolean;
}) {
  return (
    <h2 className={cn("font-bold", className)}>
           {formatMoney(amount)}

      {showSymbol && "  FCFA"}
    </h2>
  );
}
