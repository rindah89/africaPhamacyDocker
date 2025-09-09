"use client";
import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import components to avoid SSR issues
const MultipleImageInput = dynamic(() => import('./MultipleImageInput'), { ssr: false });
const MultipleImageInputLocal = dynamic(() => import('./MultipleImageInputLocal'), { ssr: false });

type MultipleImageInputWrapperProps = {
  title: string;
  imageUrls: string[];
  setImageUrls: (urls: string[]) => void;
  endpoint?: string;
  maxImages?: number;
};

export default function MultipleImageInputWrapper(props: MultipleImageInputWrapperProps) {
  const useLocalStorage = process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === 'true';
  
  if (useLocalStorage) {
    return <MultipleImageInputLocal {...props} />;
  }
  
  return <MultipleImageInput {...props} />;
}