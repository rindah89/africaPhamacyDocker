"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { useUpload } from "@/lib/useUpload";
import { Progress } from "@/components/ui/progress";

type MultipleImageInputProps = {
  title: string;
  imageUrls: string[];
  setImageUrls: (urls: string[]) => void;
  endpoint?: string;
  maxImages?: number;
};

export default function MultipleImageInputLocal({
  title,
  imageUrls,
  setImageUrls,
  endpoint,
  maxImages = 3,
}: MultipleImageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { uploadFiles, isUploading, uploadProgress } = useUpload(endpoint);

  const handleFilesSelect = async (files: FileList) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxImages - imageUrls.length;
    const filesToUpload = fileArray.slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    try {
      const results = await uploadFiles(filesToUpload);
      const newUrls = results.map(result => result.url);
      setImageUrls([...imageUrls, ...newUrls]);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload images. Please try again.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelect(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {/* Image Preview Grid */}
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <Image
                    alt={`${title} ${index + 1}`}
                    className="h-24 w-full rounded-md object-cover"
                    height="100"
                    src={url || "/placeholder.svg"}
                    width="100"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Area */}
          {imageUrls.length < maxImages && (
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
                multiple
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
                    Drag and drop images here, or click to select
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Choose Images
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    {imageUrls.length}/{maxImages} images uploaded
                  </p>
                </>
              )}
            </div>
          )}

          <p className="text-xs text-gray-500">
            Supported formats: JPEG, PNG, WebP (max 4MB per image)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}