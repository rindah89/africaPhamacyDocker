"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  sizes?: string;
  fallbackSrc?: string;
}

export default function ImageWithFallback({
  src,
  alt,
  width,
  height,
  className,
  fill,
  sizes,
  fallbackSrc = "/placeholder.svg",
}: ImageWithFallbackProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className={cn("relative", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}
      <Image
        src={error ? fallbackSrc : src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        sizes={sizes}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
} 