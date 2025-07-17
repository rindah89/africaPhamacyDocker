'use client';

import DataTable from "@/components/DataTableComponents/DataTable";
import { useBarcodeColumns } from "./columns";
import { Button } from "@/components/ui/button";
import BarcodeSheet from "@/components/dashboard/BarcodeSheet";
import SelectedBatchesList from "@/components/dashboard/SelectedBatchesList";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, X, Trash2, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBarcodeSelection } from "@/hooks/use-barcode-selection";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PrintBarcodesPageProps {
  batches: any[];
}

type DatePreset = "lifetime" | "today" | "last7days" | "thismonth" | "thisyear" | "custom";

export default function PrintBarcodesPage({ batches }: PrintBarcodesPageProps) {
  const { selectedBatches, clearAllBatches, getTotalBarcodes } = useBarcodeSelection();
  const columns = useBarcodeColumns();
  const [searchTerm, setSearchTerm] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>("lifetime");
  const [showDateFilters, setShowDateFilters] = useState(false);
  
  // Date filters
  const [expiryDateFrom, setExpiryDateFrom] = useState("");
  const [expiryDateTo, setExpiryDateTo] = useState("");
  const [deliveryDateFrom, setDeliveryDateFrom] = useState("");
  const [deliveryDateTo, setDeliveryDateTo] = useState("");
  const [createdDateFrom, setCreatedDateFrom] = useState("");
  const [createdDateTo, setCreatedDateTo] = useState("");

  // Helper function to get date range based on preset
  const getDateRangeFromPreset = (preset: DatePreset) => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    switch (preset) {
      case "today":
        return {
          from: formatDate(today),
          to: formatDate(today)
        };
      case "last7days":
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return {
          from: formatDate(sevenDaysAgo),
          to: formatDate(today)
        };
      case "thismonth":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return {
          from: formatDate(startOfMonth),
          to: formatDate(endOfMonth)
        };
      case "thisyear":
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31);
        return {
          from: formatDate(startOfYear),
          to: formatDate(endOfYear)
        };
      case "lifetime":
      case "custom":
      default:
        return null;
    }
  };

  // Apply preset to all date filters
  const applyDatePreset = (preset: DatePreset) => {
    setDatePreset(preset);
    
    if (preset === "lifetime") {
      // Clear all date filters
      setExpiryDateFrom("");
      setExpiryDateTo("");
      setDeliveryDateFrom("");
      setDeliveryDateTo("");
      setCreatedDateFrom("");
      setCreatedDateTo("");
      setShowDateFilters(false);
    } else if (preset === "custom") {
      // Show date filters for custom selection
      setShowDateFilters(true);
    } else {
      const range = getDateRangeFromPreset(preset);
      if (range) {
        // Apply to created date by default for non-custom presets
        setCreatedDateFrom(range.from);
        setCreatedDateTo(range.to);
        // Clear other date filters when using presets
        setExpiryDateFrom("");
        setExpiryDateTo("");
        setDeliveryDateFrom("");
        setDeliveryDateTo("");
      }
      setShowDateFilters(false);
    }
  };

  // Client-side filtering based on search term and date filters
  const filteredBatches = useMemo(() => {
    let filtered = batches;

    // Text search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(batch => 
        batch.product?.name?.toLowerCase().includes(searchLower) ||
        batch.batchNumber?.toLowerCase().includes(searchLower) ||
        batch.product?.productCode?.toLowerCase().includes(searchLower) ||
        batch.product?.supplier?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Date filters
    filtered = filtered.filter(batch => {
      // Expiry date filter
      if (expiryDateFrom && batch.expiryDate) {
        const expiryDate = new Date(batch.expiryDate);
        const fromDate = new Date(expiryDateFrom);
        if (expiryDate < fromDate) return false;
      }
      if (expiryDateTo && batch.expiryDate) {
        const expiryDate = new Date(batch.expiryDate);
        const toDate = new Date(expiryDateTo + "T23:59:59");
        if (expiryDate > toDate) return false;
      }
      // If expiry date filters are set but batch has no expiry date, exclude it
      if ((expiryDateFrom || expiryDateTo) && !batch.expiryDate) {
        return false;
      }

      // Delivery date filter
      if (deliveryDateFrom && batch.deliveryDate) {
        const deliveryDate = new Date(batch.deliveryDate);
        const fromDate = new Date(deliveryDateFrom);
        if (deliveryDate < fromDate) return false;
      }
      if (deliveryDateTo && batch.deliveryDate) {
        const deliveryDate = new Date(batch.deliveryDate);
        const toDate = new Date(deliveryDateTo + "T23:59:59");
        if (deliveryDate > toDate) return false;
      }
      // If delivery date filters are set but batch has no delivery date, exclude it
      if ((deliveryDateFrom || deliveryDateTo) && !batch.deliveryDate) {
        return false;
      }

      // Created date filter
      if (createdDateFrom && batch.createdAt) {
        const createdDate = new Date(batch.createdAt);
        const fromDate = new Date(createdDateFrom);
        if (createdDate < fromDate) return false;
      }
      if (createdDateTo && batch.createdAt) {
        const createdDate = new Date(batch.createdAt);
        const toDate = new Date(createdDateTo + "T23:59:59");
        if (createdDate > toDate) return false;
      }
      // If created date filters are set but batch has no created date, exclude it
      if ((createdDateFrom || createdDateTo) && !batch.createdAt) {
        return false;
      }

      return true;
    });

    return filtered;
  }, [batches, searchTerm, expiryDateFrom, expiryDateTo, deliveryDateFrom, deliveryDateTo, createdDateFrom, createdDateTo]);

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleClearAllFilters = () => {
    setSearchTerm("");
    setDatePreset("lifetime");
    setExpiryDateFrom("");
    setExpiryDateTo("");
    setDeliveryDateFrom("");
    setDeliveryDateTo("");
    setCreatedDateFrom("");
    setCreatedDateTo("");
    setShowDateFilters(false);
  };

  const hasActiveFilters = searchTerm || expiryDateFrom || expiryDateTo || deliveryDateFrom || deliveryDateTo || createdDateFrom || createdDateTo;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Print Batch Barcodes</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {selectedBatches.length} batches selected
            {hasActiveFilters && ` • ${filteredBatches.length} of ${batches.length} batches shown`}
          </div>
          {selectedBatches.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {getTotalBarcodes()} total barcodes
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllBatches}
                className="h-8 px-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Search and Filter Controls */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by product name, batch number, product code, or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          {/* Date Preset Selector */}
          <Select value={datePreset} onValueChange={(value: DatePreset) => applyDatePreset(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lifetime">Life time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="thismonth">This Month</SelectItem>
              <SelectItem value="thisyear">This Year</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAllFilters}
            >
              Clear All Filters
            </Button>
          )}
        </div>

        {/* Custom Date Filters */}
        {datePreset === "custom" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/30">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Expiry Date Range
              </Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={expiryDateFrom}
                  onChange={(e) => setExpiryDateFrom(e.target.value)}
                  placeholder="From"
                  className="text-sm"
                />
                <Input
                  type="date"
                  value={expiryDateTo}
                  onChange={(e) => setExpiryDateTo(e.target.value)}
                  placeholder="To"
                  className="text-sm"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Delivery Date Range
              </Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={deliveryDateFrom}
                  onChange={(e) => setDeliveryDateFrom(e.target.value)}
                  placeholder="From"
                  className="text-sm"
                />
                <Input
                  type="date"
                  value={deliveryDateTo}
                  onChange={(e) => setDeliveryDateTo(e.target.value)}
                  placeholder="To"
                  className="text-sm"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Created Date Range
              </Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={createdDateFrom}
                  onChange={(e) => setCreatedDateFrom(e.target.value)}
                  placeholder="From"
                  className="text-sm"
                />
                <Input
                  type="date"
                  value={createdDateTo}
                  onChange={(e) => setCreatedDateTo(e.target.value)}
                  placeholder="To"
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <DataTable
            columns={columns}
            data={filteredBatches}
            initialSorting={[{ id: "expiryDate", desc: false }]}
            hideSearch={true}
            hideFilters={true}
          />
        </div>
        <div className="space-y-4">
          <SelectedBatchesList />
          <BarcodeSheet selectedBatches={selectedBatches} clearAllBatches={clearAllBatches} />
        </div>
      </div>
    </div>
  );
} 