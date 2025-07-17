import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stock Analytics | Inventory Management',
  description: 'Advanced stock optimization analytics with demand forecasting and optimal quantity recommendations',
};

export default function StockAnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col space-y-6 p-6">
      {children}
    </div>
  );
} 