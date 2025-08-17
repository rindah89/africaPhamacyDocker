import { useSyncExternalStore } from 'react';
import { BarcodeBatch } from '@/types/batch';

// Safely retrieve selected batches from localStorage
const getInitialSelectedBatches = (): BarcodeBatch[] => {
  if (typeof window !== 'undefined') {
    try {
      const storedBatches = localStorage.getItem("selectedBarcodeBatches");
      if (storedBatches) {
        const parsed = JSON.parse(storedBatches);
        return parsed.map((batch: any) => ({
          ...batch,
          expiryDate: batch.expiryDate ? new Date(batch.expiryDate) : null,
          deliveryDate: batch.deliveryDate ? new Date(batch.deliveryDate) : null,
          createdAt: batch.createdAt ? new Date(batch.createdAt) : new Date(),
          updatedAt: batch.updatedAt ? new Date(batch.updatedAt) : new Date(),
        }));
      }
    } catch (error) {
      console.error("Failed to parse selected barcode batches from localStorage", error);
    }
  }
  return [];
};

// Module-scoped store so all hook instances share the same state within a tab
let selectedBatchesState: BarcodeBatch[] = getInitialSelectedBatches();
const listeners = new Set<() => void>();

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

const persist = (batches: BarcodeBatch[]) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem("selectedBarcodeBatches", JSON.stringify(batches));
    } catch (error) {
      console.error("Failed to save selected barcode batches to localStorage", error);
    }
  }
};

const setBatches = (updater: (prev: BarcodeBatch[]) => BarcodeBatch[]) => {
  selectedBatchesState = updater(selectedBatchesState);
  persist(selectedBatchesState);
  notifyListeners();
};

// Cross-tab sync (optional)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'selectedBarcodeBatches' && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        selectedBatchesState = parsed;
        notifyListeners();
      } catch (_) {
        // ignore
      }
    }
  });
}

export const useBarcodeSelection = () => {
  const selectedBatches = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => selectedBatchesState,
    () => selectedBatchesState
  );

  const addBatch = (batch: BarcodeBatch) => {
    setBatches((prev) => {
      const existingIndex = prev.findIndex((b) => b.id === batch.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = batch;
        return updated;
      }
      return [...prev, batch];
    });
  };

  const removeBatch = (batchId: string) => {
    setBatches((prev) => prev.filter((batch) => batch.id !== batchId));
  };

  const clearAllBatches = () => {
    setBatches(() => []);
  };

  const updateBatchQuantity = (batchId: string, quantity: number) => {
    setBatches((prev) =>
      prev.map((batch) =>
        batch.id === batchId ? { ...batch, quantity: Math.max(1, quantity) } : batch
      )
    );
  };

  const getTotalBarcodes = () => {
    return selectedBatches.reduce((total, batch) => total + batch.quantity, 0);
  };

  const getBatchById = (batchId: string) => {
    return selectedBatches.find((batch) => batch.id === batchId);
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