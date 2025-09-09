"use client";
import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import components to avoid SSR issues
const ImageInput = dynamic(() => import('./ImageInput'), { ssr: false });
const ImageInputLocal = dynamic(() => import('./ImageInputLocal'), { ssr: false });

type ImageInputWrapperProps = {
  title: string;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  endpoint?: string;
};

export default function ImageInputWrapper(props: ImageInputWrapperProps) {
  const useLocalStorage = process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === 'true';
  
  if (useLocalStorage) {
    return <ImageInputLocal {...props} />;
  }
  
  return <ImageInput {...props} />;
}