"use client";

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';

interface Product {
  id: string;
  name: string;
  productThumbnail: string;
  productPrice: number;
  stockQty: number;
}

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const { addToCart } = useCart();

  const handleProductClick = (product: Product) => {
    if (product.stockQty > 0) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.productPrice,
        quantity: 1,
        image: product.productThumbnail
      });
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-y-auto h-[calc(100vh-280px)]">
      {products.map((product) => (
        <Card 
          key={product.id}
          className={`cursor-pointer transition-all hover:scale-105 ${
            product.stockQty === 0 ? 'opacity-50' : ''
          }`}
          onClick={() => handleProductClick(product)}
        >
          <CardContent className="p-3">
            <div className="aspect-square relative mb-2">
              <Image
                src={product.productThumbnail}
                alt={product.name}
                fill
                className="object-cover rounded-md"
              />
            </div>
            <div className="space-y-1">
              <p className="font-medium truncate" title={product.name}>
                {product.name}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">
                  {formatCurrency(product.productPrice)}
                </span>
                <span className={`text-xs ${
                  product.stockQty === 0 ? 'text-destructive' : 'text-muted-foreground'
                }`}>
                  Stock: {product.stockQty}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 