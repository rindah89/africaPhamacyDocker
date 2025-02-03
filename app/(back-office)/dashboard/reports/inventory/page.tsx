import React from "react";
import InventoryReport from "@/components/dashboard/Reports/InventoryReport";
import { getInventoryReport } from "@/actions/reports";

export default async function page() {
  const data = await getInventoryReport();
  if (!data) return <div>Error loading inventory report</div>;
  
  return <InventoryReport products={data.products} totals={data.totals} />;
}
