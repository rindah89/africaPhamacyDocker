'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function FixBatchesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleFixBatches = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/fix-batches', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        router.refresh();
      } else {
        toast.error(data.error || 'Failed to fix batches');
      }
    } catch (error) {
      console.error('Error fixing batches:', error);
      toast.error('Failed to fix batches');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Fix Orphaned Batches</CardTitle>
          <CardDescription>
            This tool will clean up any product batches that are no longer associated with valid products.
            Use this if you're experiencing issues with orphaned batch records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleFixBatches} 
            variant="destructive"
            disabled={isLoading}
          >
            {isLoading ? 'Fixing Batches...' : 'Fix Orphaned Batches'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 