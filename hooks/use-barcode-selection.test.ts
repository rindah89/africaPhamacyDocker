// Simple test file to verify barcode selection hook functionality
// This is not a comprehensive test suite, just a basic verification

import { renderHook, act } from '@testing-library/react';
import { useBarcodeSelection } from './use-barcode-selection';
import { BarcodeBatch } from '@/types/batch';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useBarcodeSelection', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  it('should initialize with empty array when no localStorage data', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useBarcodeSelection());
    
    expect(result.current.selectedBatches).toEqual([]);
  });

  it('should load data from localStorage on initialization', () => {
    const mockData = [
      {
        id: '1',
        batchNumber: 'BATCH001',
        quantity: 5,
        expiryDate: new Date('2024-12-31'),
        deliveryDate: null,
        costPerUnit: 80,
        notes: null,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        productId: 'prod1',
        product: {
          name: 'Test Product',
          productCode: 'TEST001',
          productPrice: 100,
          supplier: null,
        },
      }
    ];
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));
    
    const { result } = renderHook(() => useBarcodeSelection());
    
    expect(result.current.selectedBatches).toEqual(mockData);
  });

  it('should add a batch correctly', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useBarcodeSelection());
    
    const newBatch = {
      id: '1',
      batchNumber: 'BATCH002',
      quantity: 3,
      expiryDate: new Date('2024-12-31'),
      deliveryDate: null,
      costPerUnit: 40,
      notes: null,
      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      productId: 'prod1',
      product: {
        name: 'New Product',
        productCode: 'NEW001',
        productPrice: 50,
        supplier: null,
      },
    };
    
    act(() => {
      result.current.addBatch(newBatch);
    });
    
    expect(result.current.selectedBatches).toHaveLength(1);
    expect(result.current.selectedBatches[0]).toEqual(newBatch);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'selectedBarcodeBatches',
      JSON.stringify([newBatch])
    );
  });

  it('should remove a batch correctly', () => {
    const mockData: BarcodeBatch[] = [
      {
        id: '1',
        batchNumber: 'B1',
        quantity: 5,
        expiryDate: new Date('2024-12-31'),
        deliveryDate: null,
        costPerUnit: 80,
        notes: null,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        productId: 'prod1',
        product: { name: 'Product 1', productCode: 'P1', productPrice: 100, supplier: null },
      },
      {
        id: '2',
        batchNumber: 'B2',
        quantity: 3,
        expiryDate: new Date('2024-12-31'),
        deliveryDate: null,
        costPerUnit: 150,
        notes: null,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        productId: 'prod2',
        product: { name: 'Product 2', productCode: 'P2', productPrice: 200, supplier: null },
      }
    ];
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));
    
    const { result } = renderHook(() => useBarcodeSelection());
    
    act(() => {
      result.current.removeBatch('1');
    });
    
    expect(result.current.selectedBatches).toHaveLength(1);
    expect(result.current.selectedBatches[0].id).toBe('2');
  });

  it('should clear all batches', () => {
    const mockData: BarcodeBatch[] = [
      {
        id: '1',
        batchNumber: 'B1',
        quantity: 5,
        expiryDate: new Date('2024-12-31'),
        deliveryDate: null,
        costPerUnit: 80,
        notes: null,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        productId: 'prod1',
        product: { name: 'Product 1', productCode: 'P1', productPrice: 100, supplier: null },
      }
    ];
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));
    
    const { result } = renderHook(() => useBarcodeSelection());
    
    act(() => {
      result.current.clearAllBatches();
    });
    
    expect(result.current.selectedBatches).toEqual([]);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'selectedBarcodeBatches',
      JSON.stringify([])
    );
  });

  it('should calculate total barcodes correctly', () => {
    const mockData: BarcodeBatch[] = [
      {
        id: '1',
        batchNumber: 'B1',
        quantity: 5,
        expiryDate: new Date('2024-12-31'),
        deliveryDate: null,
        costPerUnit: 80,
        notes: null,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        productId: 'prod1',
        product: { name: 'Product 1', productCode: 'P1', productPrice: 100, supplier: null },
      },
      {
        id: '2',
        batchNumber: 'B2',
        quantity: 3,
        expiryDate: new Date('2024-12-31'),
        deliveryDate: null,
        costPerUnit: 150,
        notes: null,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        productId: 'prod2',
        product: { name: 'Product 2', productCode: 'P2', productPrice: 200, supplier: null },
      }
    ];
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));
    
    const { result } = renderHook(() => useBarcodeSelection());
    
    expect(result.current.getTotalBarcodes()).toBe(8);
  });
}); 