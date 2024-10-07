import React from "react";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Karen Pharmacy",
  description:
    "Karen Pharmacy: Your trusted partner in health. We offer quality medications, expert care, and a wide range of health products to serve our community in Douala, Cameroon.",
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
