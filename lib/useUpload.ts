"use client";
import { useState } from 'react';

type UploadResult = {
  url: string;
  name: string;
  size: number;
  type: string;
};

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Check if we should use local storage (in Docker environment)
  const useLocalStorage = process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === 'true';

  const uploadFiles = async (files: File[]): Promise<UploadResult[]> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      if (useLocalStorage) {
        // Use local file storage
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        
        const response = await fetch('/api/upload/local', {
          method: 'PUT',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Upload failed');
        }
        
        const data = await response.json();
        setUploadProgress(100);
        return data.files;
      } else {
        throw new Error('UploadThing not configured for this environment');
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFile = async (file: File): Promise<UploadResult> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      if (useLocalStorage) {
        // Use local file storage
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload/local', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Upload failed');
        }
        
        setUploadProgress(100);
        return await response.json();
      } else {
        throw new Error('UploadThing not configured for this environment');
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    uploadFiles,
    isUploading,
    uploadProgress,
  };
}