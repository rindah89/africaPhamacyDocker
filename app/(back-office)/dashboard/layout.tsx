"use client";

import { Toaster } from 'sonner';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    console.log('DashboardLayout: Modern layout mounted');
    return () => {
      console.log('DashboardLayout: Modern layout unmounting');
    };
  }, []);

  return (
    <>
      {children}
      <Toaster richColors />
    </>
  );
} 