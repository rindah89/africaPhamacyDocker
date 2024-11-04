"use client";

import { Product } from "@prisma/client";
import React, { useState } from "react";
import { Input } from "../ui/input";

interface SearchItemsProps {
  data: Product[];
  onSearch: (results: Product[]) => void;
  onBarcodeScan?: (product: Product | null) => void;
}

export default function SearchItems({ data, onSearch, onBarcodeScan }: SearchItemsProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Filter results for normal search
    const results = data.filter((item) =>
      item.name.toLowerCase().includes(value.toLowerCase()) ||
      item.productCode.toLowerCase().includes(value.toLowerCase())
    );
    onSearch(results);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Check if this is a barcode scan (exact match with productCode)
      const scannedProduct = data.find(p => p.productCode === searchTerm);
      if (scannedProduct && onBarcodeScan) {
        onBarcodeScan(scannedProduct);
        setSearchTerm(''); // Clear input after scan
        onSearch(data); // Reset search results
      }
    }
  };

  return (
    <div className="col-span-3 pb-4 px-4">
      <Input
        type="search"
        placeholder="Search products or scan barcode..."
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="w-full"
        autoFocus
      />
    </div>
  );
}
