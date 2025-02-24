import { redirect } from "next/navigation";
import React from "react";

export default function page() {
  redirect("/dashboard/reports/products");
  return (
    <div>
      <p>Loading..</p>
    </div>
  );
}
