"use client";

import { Product } from "@prisma/client";
import React, { useCallback, useState } from "react";
import { Input } from "../ui/input";
import { searchProducts } from "@/actions/products";
import { useDebounce } from "@/hooks/useDebounce";
import { Loader2 } from "lucide-react";

interface SearchItemsProps {
  data: Product[];
  onSearch: (results: Product[]) => void;
  onBarcodeScan?: (product: Product | null) => void;
}

export default function SearchItems({ data, onSearch, onBarcodeScan }: SearchItemsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the search to avoid too many server requests
  const debouncedSearch = useDebounce(async (value: string) => {
    if (!value.trim()) {
      onSearch(data); // Reset to original data if search is empty
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchProducts(value);
      if (results) {
        onSearch(results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // If it looks like a barcode (exact match), don't debounce
    const exactMatch = data.find(p => p.productCode === value);
    if (exactMatch) {
      if (onBarcodeScan) {
        onBarcodeScan(exactMatch);
        setSearchTerm('');
        onSearch(data);
      }
      return;
    }

    // Otherwise, use debounced search
    debouncedSearch(value);
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
    <div className="col-span-3 pb-4 px-4 relative">
      <Input
        type="search"
        placeholder="Search products or scan barcode..."
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="w-full"
        autoFocus
      />
      {isSearching && (
        <div className="absolute right-8 top-2">
          <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
        </div>
      )}
    </div>
  );
}
