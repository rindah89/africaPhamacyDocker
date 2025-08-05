"use client";
import React from "react";
import dynamic from "next/dynamic";
// import stylesheet if you're not already using CSS @import
import "react-image-gallery/styles/css/image-gallery.css";

// Dynamically import ImageGallery with no SSR to avoid React 19 compatibility issues
const ImageGallery = dynamic(() => import("react-image-gallery"), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-100 animate-pulse rounded-lg" />
});

const images = [
  {
    original: "https://picsum.photos/id/1018/1000/600/",
    thumbnail: "https://picsum.photos/id/1018/250/150/",
  },
  {
    original: "https://picsum.photos/id/1015/1000/600/",
    thumbnail: "https://picsum.photos/id/1015/250/150/",
  },
  {
    original: "https://picsum.photos/id/1019/1000/600/",
    thumbnail: "https://picsum.photos/id/1019/250/150/",
  },
];
export type ImageProps = {
  original: string;
  thumbnail: string;
};
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ProductImageGallery error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function ImageGalleryWithFallback({ images }: { images: ImageProps[] }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="w-full">
          <img
            src={images[0]?.original || "/placeholder.svg"}
            alt="Product"
            className="w-full h-96 object-cover rounded-lg"
          />
          <div className="flex gap-2 mt-2">
            {images.slice(0, 4).map((img, idx) => (
              <img
                key={idx}
                src={img.thumbnail}
                alt={`Thumbnail ${idx + 1}`}
                className="w-20 h-20 object-cover rounded"
              />
            ))}
          </div>
        </div>
      }
    >
      <ImageGallery items={images} />
    </ErrorBoundary>
  );
}

export default function ProductImageGallery({
  images,
}: {
  images: ImageProps[];
}) {
  return <ImageGalleryWithFallback images={images} />;
}
