import React from "react";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About MMA",
  description:
    "Stockiy is a 3 in 1 system that offers POS, Ecommerce and Inventory Mgt system",
  alternates: {
    canonical: "/about",
    languages: {
      "en-US": "/en-US",
    },
  },
};

export default function page() {
  return (
    <div>
      <h2>About Page</h2>
    </div>
  );
}
