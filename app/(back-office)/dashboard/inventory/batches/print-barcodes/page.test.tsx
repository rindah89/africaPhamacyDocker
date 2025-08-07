// Test file to verify filtering functionality
// This is a basic test to ensure filters work as expected

import { render, screen, fireEvent } from '@testing-library/react';
import PrintBarcodesPage from './page';
import { ProductBatch } from '@/types/batch';

// Mock the custom hooks
jest.mock('@/hooks/use-barcode-selection', () => ({
  useBarcodeSelection: () => ({
    selectedBatches: [],
    clearAllBatches: jest.fn(),
    getTotalBarcodes: () => 0,
  }),
}));

jest.mock('./columns', () => ({
  useBarcodeColumns: () => [
    {
      id: "select",
      header: () => <div>Select</div>,
      cell: () => <div>Checkbox</div>,
    },
    {
      accessorKey: "product.name",
      header: "Product Name",
    },
    {
      accessorKey: "quantity",
      header: "Number of Tickets",
    },
  ],
}));

// Mock the components
jest.mock('@/components/dashboard/SelectedBatchesList', () => {
  return function MockSelectedBatchesList() {
    return <div data-testid="selected-batches-list">Selected Batches List</div>;
  };
});

jest.mock('@/components/dashboard/BarcodeSheet', () => {
  return function MockBarcodeSheet() {
    return <div data-testid="barcode-sheet">Barcode Sheet</div>;
  };
});

jest.mock('@/components/DataTableComponents/DataTable', () => {
  return function MockDataTable({ data }: { data: any[] }) {
    return <div data-testid="data-table">Data Table with {data.length} items</div>;
  };
});

describe('PrintBarcodesPage Filtering', () => {
  const mockBatches: ProductBatch[] = [
    {
      id: '1',
      batchNumber: 'BATCH001',
      quantity: 10,
      expiryDate: new Date('2024-12-31T00:00:00.000Z'),
      deliveryDate: new Date('2024-01-15T00:00:00.000Z'),
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      costPerUnit: 80,
      notes: null,
      status: true,
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      productId: 'prod1',
      product: {
        name: 'Aspirin',
        productCode: 'ASP001',
        productPrice: 100,
        supplier: {
          name: 'PharmaCorp',
        },
      },
    },
    {
      id: '2',
      batchNumber: 'BATCH002',
      quantity: 5,
      expiryDate: new Date('2024-06-30T00:00:00.000Z'),
      deliveryDate: new Date('2024-02-01T00:00:00.000Z'),
      createdAt: new Date('2024-02-01T00:00:00.000Z'),
      costPerUnit: 40,
      notes: null,
      status: true,
      updatedAt: new Date('2024-02-01T00:00:00.000Z'),
      productId: 'prod2',
      product: {
        name: 'Paracetamol',
        productCode: 'PAR001',
        productPrice: 50,
        supplier: {
          name: 'MedSupply',
        },
      },
    },
    {
      id: '3',
      batchNumber: 'BATCH003',
      quantity: 15,
      expiryDate: new Date('2024-03-31T00:00:00.000Z'),
      deliveryDate: new Date('2024-03-01T00:00:00.000Z'),
      createdAt: new Date('2024-03-01T00:00:00.000Z'),
      costPerUnit: 60,
      notes: null,
      status: true,
      updatedAt: new Date('2024-03-01T00:00:00.000Z'),
      productId: 'prod3',
      product: {
        name: 'Ibuprofen',
        productCode: 'IBU001',
        productPrice: 75,
        supplier: {
          name: 'PharmaCorp',
        },
      },
    },
  ];

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should render all batches initially', () => {
    render(<PrintBarcodesPage batches={mockBatches} />);
    
    expect(screen.getByTestId('data-table')).toHaveTextContent('Data Table with 3 items');
  });

  it('should filter by search term', () => {
    render(<PrintBarcodesPage batches={mockBatches} />);
    
    const searchInput = screen.getByPlaceholderText(/search by product name/i);
    fireEvent.change(searchInput, { target: { value: 'Aspirin' } });
    
    expect(screen.getByTestId('data-table')).toHaveTextContent('Data Table with 1 items');
  });

  it('should filter by supplier name', () => {
    render(<PrintBarcodesPage batches={mockBatches} />);
    
    const searchInput = screen.getByPlaceholderText(/search by product name/i);
    fireEvent.change(searchInput, { target: { value: 'PharmaCorp' } });
    
    expect(screen.getByTestId('data-table')).toHaveTextContent('Data Table with 2 items');
  });

  it('should filter by batch number', () => {
    render(<PrintBarcodesPage batches={mockBatches} />);
    
    const searchInput = screen.getByPlaceholderText(/search by product name/i);
    fireEvent.change(searchInput, { target: { value: 'BATCH001' } });
    
    expect(screen.getByTestId('data-table')).toHaveTextContent('Data Table with 1 items');
  });

  it('should clear search when clear button is clicked', () => {
    render(<PrintBarcodesPage batches={mockBatches} />);
    
    const searchInput = screen.getByPlaceholderText(/search by product name/i);
    fireEvent.change(searchInput, { target: { value: 'Aspirin' } });
    
    expect(screen.getByTestId('data-table')).toHaveTextContent('Data Table with 1 items');
    
    const clearButton = screen.getByRole('button', { name: /x/i });
    fireEvent.click(clearButton);
    
    expect(screen.getByTestId('data-table')).toHaveTextContent('Data Table with 3 items');
  });

  it('should show filter status in header', () => {
    render(<PrintBarcodesPage batches={mockBatches} />);
    
    const searchInput = screen.getByPlaceholderText(/search by product name/i);
    fireEvent.change(searchInput, { target: { value: 'Aspirin' } });
    
    expect(screen.getByText(/1 of 3 batches shown/)).toBeInTheDocument();
  });

  it('should show clear all filters button when filters are active', () => {
    render(<PrintBarcodesPage batches={mockBatches} />);
    
    const searchInput = screen.getByPlaceholderText(/search by product name/i);
    fireEvent.change(searchInput, { target: { value: 'Aspirin' } });
    
    expect(screen.getByRole('button', { name: /clear all filters/i })).toBeInTheDocument();
  });

  it('should clear all filters when clear all button is clicked', () => {
    render(<PrintBarcodesPage batches={mockBatches} />);
    
    const searchInput = screen.getByPlaceholderText(/search by product name/i);
    fireEvent.change(searchInput, { target: { value: 'Aspirin' } });
    
    const clearAllButton = screen.getByRole('button', { name: /clear all filters/i });
    fireEvent.click(clearAllButton);
    
    expect(screen.getByTestId('data-table')).toHaveTextContent('Data Table with 3 items');
    expect(searchInput).toHaveValue('');
  });
}); 