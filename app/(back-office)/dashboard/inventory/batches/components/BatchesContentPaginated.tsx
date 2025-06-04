"use client";

import { useEffect, useState, useTransition, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "@/components/dashboard/Tables/TableHeader";
import { columns } from "../columns";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, RefreshCw, Search, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { getBatchesPaginated, fixOrphanedBatches, getExpiringBatches, ProductBatch } from "@/actions/batches";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PaginatedBatchesData {
  batches: ProductBatch[];
  total: number;
  hasMore: boolean;
}

export default function BatchesContentPaginated() {
  const [batchesData, setBatchesData] = useState<PaginatedBatchesData>({
    batches: [],
    total: 0,
    hasMore: false
  });
  const [expiringBatches, setExpiringBatches] = useState<ProductBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFixing, startFixing] = useTransition();
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial page from URL params
  useEffect(() => {
    const page = searchParams.get('page');
    if (page) {
      setCurrentPage(parseInt(page, 10));
    }
  }, [searchParams]);

  const fetchBatches = useCallback(async (page: number = 1, showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      
      const [batchesResult, expiringResult] = await Promise.all([
        getBatchesPaginated(page, pageSize),
        getExpiringBatches(30) // Get batches expiring in next 30 days
      ]);
      
      setBatchesData(batchesResult);
      setExpiringBatches(expiringResult);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch batches");
      console.error("Error fetching batches:", err);
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchBatches(currentPage);
  }, [currentPage, fetchBatches]);

  // Filter batches based on search term
  const filteredBatches = useMemo(() => {
    if (!searchTerm.trim()) return batchesData.batches;
    
    return batchesData.batches.filter(batch => 
      batch.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.product.productCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [batchesData.batches, searchTerm]);

  const handleFixOrphanedBatches = () => {
    startFixing(async () => {
      try {
        const result = await fixOrphanedBatches();
        toast.success(result.message);
        
        if (result.fixed > 0) {
          // Refresh data after fixing orphaned batches
          await fetchBatches(currentPage);
        }
      } catch (error) {
        toast.error("Failed to fix orphaned batches");
        console.error("Error fixing orphaned batches:", error);
      }
    });
  };

  const handleRefresh = () => {
    fetchBatches(currentPage, true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Update URL without causing a page reload
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    window.history.pushState({}, '', url.toString());
  };

  const totalPages = Math.ceil(batchesData.total / pageSize);

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
      {/* Expiring Batches Alert */}
      {expiringBatches.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Expiring Batches Alert
            </CardTitle>
            <CardDescription className="text-orange-700">
              {expiringBatches.length} batch(es) expiring in the next 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {expiringBatches.slice(0, 5).map((batch) => (
                <Badge key={batch.id} variant="outline" className="text-orange-800 border-orange-300">
                  {batch.product.name} - {batch.batchNumber}
                </Badge>
              ))}
              {expiringBatches.length > 5 && (
                <Badge variant="outline" className="text-orange-800 border-orange-300">
                  +{expiringBatches.length - 5} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header Section */}
      <div className="flex justify-between items-center">
        <TableHeader
          title={`Product Batches (${batchesData.total})`}
          linkTitle="Add Batch"
          href="/dashboard/inventory/batches/new"
          data={batchesData.batches}
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

      {/* Search Input */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search batches by product name, batch number, or product code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchTerm("")}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Data Table */}
      <div className="rounded-md border">
        <DataTable 
          columns={columns} 
          data={filteredBatches}
          initialSorting={[{ id: "expiryDate", desc: false }]}
        />
      </div>

      {/* Pagination */}
      {!searchTerm && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, batchesData.total)} of {batchesData.total} batches
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            
            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredBatches.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm ? "No batches found matching your search." : "No batches found."}
          </p>
          {!searchTerm && (
            <Link href="/dashboard/inventory/batches/new">
              <Button className="mt-4">Add Your First Batch</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
} 