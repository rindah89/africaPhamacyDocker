# Barcode Selection Feature

## Overview

The barcode selection feature allows users to select multiple batches for barcode printing with persistent state management. This solves the previous issue where selecting a new batch would clear the previously selected batches from memory.

## Key Features

### 1. Persistent Selection State
- **localStorage Integration**: Selected batches are automatically saved to localStorage and persist across browser sessions
- **No Data Loss**: Users can navigate away from the page and return without losing their selections
- **Cross-Tab Synchronization**: Selections are shared across browser tabs for the same domain

### 2. Enhanced User Interface
- **Selected Batches List**: A dedicated sidebar showing all selected batches with detailed information
- **Quantity Controls**: Users can adjust the number of barcodes for each selected batch
- **Batch Information**: Displays product name, batch number, price, supplier, delivery date, and expiry date
- **Clear All Functionality**: Easy way to clear all selections at once

### 3. Improved DataTable Integration
- **Custom Selection Logic**: Replaced DataTable's built-in selection with custom logic for better control
- **Visual Feedback**: Clear indication of selected vs unselected batches
- **Select All/None**: Bulk selection controls for the current page

### 4. Print Workflow Enhancements
- **Success Feedback**: Toast notification after successful printing
- **Auto-Clear Option**: Option to automatically clear selections after printing
- **Print Preview**: Real-time preview of barcodes before printing

## Technical Implementation

### Core Components

1. **`useBarcodeSelection` Hook** (`hooks/use-barcode-selection.ts`)
   - Manages selection state with localStorage persistence
   - Provides methods for adding, removing, and updating batches
   - Handles quantity management and total calculations

2. **`SelectedBatchesList` Component** (`components/dashboard/SelectedBatchesList.tsx`)
   - Displays selected batches in a card layout
   - Provides quantity adjustment controls
   - Shows detailed batch information

3. **`useBarcodeColumns` Hook** (`app/(back-office)/dashboard/inventory/batches/print-barcodes/columns.tsx`)
   - Custom DataTable columns with selection functionality
   - Integrates with the barcode selection hook
   - Handles select all/none logic

4. **Enhanced `BarcodeSheet` Component** (`components/dashboard/BarcodeSheet.tsx`)
   - Added clear all functionality
   - Success notifications after printing
   - Improved print button styling

### Data Structure

```typescript
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
```

### localStorage Key
- **Key**: `"selectedBarcodeBatches"`
- **Format**: JSON stringified array of BarcodeBatch objects
- **Persistence**: Survives browser restarts and tab refreshes

## Usage

### For Users
1. Navigate to the Print Barcodes page
2. Select batches using the checkboxes in the table
3. Adjust quantities using the controls in the Selected Batches sidebar
4. Review the barcode preview
5. Click "Print" to generate and print barcodes
6. Selections persist until manually cleared or after successful printing

### For Developers
1. Import the `useBarcodeSelection` hook in your component
2. Use the provided methods to manage batch selections
3. The hook automatically handles localStorage persistence
4. Access selected batches and total counts as needed

## Benefits

1. **Improved User Experience**: No more lost selections when navigating or refreshing
2. **Better Workflow**: Users can build up their selection over time
3. **Flexible Quantity Management**: Adjust quantities per batch as needed
4. **Visual Feedback**: Clear indication of what's selected and total counts
5. **Error Prevention**: Reduces frustration from lost work

## Testing

A basic test suite is included in `hooks/use-barcode-selection.test.ts` that verifies:
- Initialization with empty state
- Loading from localStorage
- Adding and removing batches
- Clearing all selections
- Total barcode calculations

## Future Enhancements

Potential improvements could include:
- Export/import selection lists
- Batch templates for common selections
- Integration with other parts of the system
- Advanced filtering and sorting options
- Bulk quantity adjustments 