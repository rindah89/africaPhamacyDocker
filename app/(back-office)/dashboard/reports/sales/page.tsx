import React from "react";
import { getSalesReport } from "@/actions/reports";
import SalesReport from "@/components/dashboard/Reports/SalesReport";

export default async function page() {
  console.log('Rendering sales report page...');
  
  const data = await getSalesReport();
  console.log('Sales report data received:', {
    hasData: !!data,
    salesCount: data?.sales?.length,
    hasTotals: !!data?.totals,
    dailySalesCount: data?.dailySales?.length
  });
  
  if (!data) {
    console.log('No data returned from getSalesReport');
    return <div>Error loading sales report</div>;
  }
  
  console.log('Rendering SalesReport component with data');
  return <SalesReport sales={data.sales} totals={data.totals} dailySales={data.dailySales} />;
} 