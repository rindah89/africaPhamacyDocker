import React from "react";
import InventoryReport from "@/components/dashboard/Reports/InventoryReport";
import { getInventoryReport } from "@/actions/reports";

export default async function page() {
  try {
    const data = await getInventoryReport();
    if (!data) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-600">Error loading inventory report</h2>
            <p className="text-sm text-gray-600 mt-2">Please try refreshing the page or contact support if the issue persists.</p>
          </div>
        </div>
      );
    }
    
    return <InventoryReport products={data.products} totals={data.totals} />;
  } catch (error) {
    console.error("Error in inventory report page:", error);
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600">Failed to load inventory report</h2>
          <p className="text-sm text-gray-600 mt-2">An unexpected error occurred. Please try again later.</p>
        </div>
      </div>
    );
  }
}
