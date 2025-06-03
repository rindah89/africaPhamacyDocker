'use client';

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import React from "react";

interface ExportButtonProps<T> {
  data: T[];
  exportFunction: (data: T[], dateRange?: { from: Date; to: Date }) => void;
  buttonText?: string;
  // We can add dateRange prop later if needed
  // dateRange?: { from: Date; to: Date };
}

export default function ExportButton<T>({
  data,
  exportFunction,
  buttonText = "Export to PDF",
}: ExportButtonProps<T>) {
  
  const handleExport = () => {
    if (data && data.length > 0) {
      exportFunction(data);
    } else {
      // Optionally, show a message to the user if there's no data
      // For example, using a toast notification
      console.warn("No data available to export.");
      alert("No data to export or data is still loading.");
    }
  };

  return (
    <Button onClick={handleExport} variant="outline" size="sm">
      <Download className="mr-2 h-4 w-4" />
      {buttonText}
    </Button>
  );
} 