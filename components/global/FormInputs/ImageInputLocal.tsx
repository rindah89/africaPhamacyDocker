"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { useUpload } from "@/lib/useUpload";
import { Progress } from "@/components/ui/progress";

type ImageInputProps = {
  title: string;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  endpoint?: string;
};

export default function ImageInputLocal({
  title,
  imageUrl,
  setImageUrl,
  endpoint,
}: ImageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { uploadFile, isUploading, uploadProgress } = useUpload(endpoint);

  const handleFileSelect = async (file: File) => {
    try {
      const result = await uploadFile(file);
      setImageUrl(result.url);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = () => {
    setImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="relative">
            <Image
              alt={title}
              className="h-40 w-full rounded-md object-cover"
              height="300"
              src={imageUrl || "/placeholder.svg"}
              width="300"
            />
            {imageUrl && imageUrl !== "/placeholder.svg" && (
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />

            {isUploading ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Uploading...</p>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop an image here, or click to select
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose Image
                </Button>
              </>
            )}
          </div>

          <p className="text-xs text-gray-500">
            Supported formats: JPEG, PNG, WebP (max 4MB)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}