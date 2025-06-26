import { useState, useEffect } from 'react';

interface BarcodeBatch {
  id: string;
  quantity: number;
  product: {
    name: string;
    productCode: string;
    productPrice: number;
    supplier?: {
      name: string;
    };
  };
  deliveryDate?: string | null;
  batchNumber: string;
  expiryDate?: string | null;
}

// Safely retrieve selected batches from localStorage
const getInitialSelectedBatches = (): BarcodeBatch[] => {
  if (typeof window !== 'undefined') {
    try {
      const storedBatches = localStorage.getItem("selectedBarcodeBatches");
      if (storedBatches) {
        return JSON.parse(storedBatches);
      }
    } catch (error) {
      console.error("Failed to parse selected barcode batches from localStorage", error);
    }
  }
  return [];
};

// Save selected batches to localStorage
const saveSelectedBatchesToLocalStorage = (batches: BarcodeBatch[]) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem("selectedBarcodeBatches", JSON.stringify(batches));
    } catch (error) {
      console.error("Failed to save selected barcode batches to localStorage", error);
    }
  }
};

export const useBarcodeSelection = () => {
  const [selectedBatches, setSelectedBatches] = useState<BarcodeBatch[]>(getInitialSelectedBatches());

  // Save to localStorage whenever selectedBatches changes
  useEffect(() => {
    saveSelectedBatchesToLocalStorage(selectedBatches);
  }, [selectedBatches]);

  const addBatch = (batch: BarcodeBatch) => {
    setSelectedBatches(prev => {
      // Check if batch already exists
      const existingIndex = prev.findIndex(b => b.id === batch.id);
      if (existingIndex >= 0) {
        // Update existing batch
        const updated = [...prev];
        updated[existingIndex] = batch;
        return updated;
      }
      // Add new batch
      return [...prev, batch];
    });
  };

  const removeBatch = (batchId: string) => {
    setSelectedBatches(prev => prev.filter(batch => batch.id !== batchId));
  };

  const clearAllBatches = () => {
    setSelectedBatches([]);
  };

  const updateBatchQuantity = (batchId: string, quantity: number) => {
    setSelectedBatches(prev => 
      prev.map(batch => 
        batch.id === batchId 
          ? { ...batch, quantity: Math.max(1, quantity) } // Ensure quantity is at least 1
          : batch
      )
    );
  };

  const getTotalBarcodes = () => {
    return selectedBatches.reduce((total, batch) => total + batch.quantity, 0);
  };

  const getBatchById = (batchId: string) => {
    return selectedBatches.find(batch => batch.id === batchId);
  };

  return {
    selectedBatches,
    addBatch,
    removeBatch,
    clearAllBatches,
    updateBatchQuantity,
    getTotalBarcodes,
    getBatchById,
  };
}; 