"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import { columns } from "../columns";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { getAllBatches, fixOrphanedBatches, ProductBatch } from "@/actions/batches";
import toast from "react-hot-toast";

export default function BatchesContent() {
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFixing, startFixing] = useTransition();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchBatches = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      const data = await getAllBatches();
      setBatches(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch batches");
      console.error("Error fetching batches:", err);
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleFixOrphanedBatches = () => {
    startFixing(async () => {
      try {
        const result = await fixOrphanedBatches();
        toast.success(result.message);
        
        if (result.fixed > 0) {
          // Refresh data after fixing orphaned batches
          await fetchBatches();
        }
      } catch (error) {
        toast.error("Failed to fix orphaned batches");
        console.error("Error fixing orphaned batches:", error);
      }
    });
  };

  const handleRefresh = () => {
    fetchBatches(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading batches...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <TableHeader
          title="Product Batches"
          linkTitle="Add Batch"
          href="/dashboard/inventory/batches/new"
          data={batches}
          model="batch"
          showPdfExport={true}
        />
        <div className="flex gap-2">
          <Button 
            onClick={handleRefresh} 
            variant="ghost" 
            size="sm"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/dashboard/inventory/batches/print-barcodes">
            <Button variant="outline">
              Print Barcodes
            </Button>
          </Link>
          <Button 
            onClick={handleFixOrphanedBatches}
            variant="destructive"
            disabled={isFixing}
          >
            {isFixing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Fix Orphaned Batches
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <DataTable 
          columns={columns} 
          data={batches}
          initialSorting={[{ id: "expiryDate", desc: false }]}
        />
      </div>

      {batches.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No batches found.</p>
          <Link href="/dashboard/inventory/batches/new">
            <Button className="mt-4">Add Your First Batch</Button>
          </Link>
        </div>
      )}
    </div>
  );
} 