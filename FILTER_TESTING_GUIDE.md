# Filter Testing Guide

## Overview

This guide helps verify that all filtering functionality in the Print Barcodes page is working correctly.

## Test Cases

### 1. Text Search Filter

**Test Steps:**
1. Navigate to Print Barcodes page
2. Enter search terms in the search box
3. Verify results are filtered correctly

**Test Cases:**
- Search by product name: "Aspirin"
- Search by batch number: "BATCH001"
- Search by product code: "ASP001"
- Search by supplier name: "PharmaCorp"
- Search with partial terms: "asp" (should find "Aspirin")
- Search with uppercase: "ASPIRIN" (should be case-insensitive)
- Clear search with X button
- Clear all filters button

**Expected Results:**
- Results should be filtered in real-time as you type
- Case-insensitive matching
- Partial matching works
- Clear buttons reset the search

### 2. Date Preset Filters

**Test Steps:**
1. Select different date presets from the dropdown
2. Verify the correct date range is applied
3. Check that the filter status shows in the header

**Test Cases:**
- "Life time" - should show all batches
- "Today" - should show batches created today
- "Last 7 days" - should show batches from last 7 days
- "This Month" - should show batches from current month
- "This Year" - should show batches from current year
- "Custom" - should show custom date input fields

**Expected Results:**
- Date presets should apply to "Created Date" by default
- Filter status should show "X of Y batches shown"
- Clear all filters should reset to "Life time"

### 3. Custom Date Filters

**Test Steps:**
1. Select "Custom" from date preset dropdown
2. Use the custom date input fields
3. Test different date combinations

**Test Cases:**
- Expiry Date Range:
  - Set "From" date only
  - Set "To" date only
  - Set both "From" and "To" dates
  - Test with batches that have no expiry date

- Delivery Date Range:
  - Set "From" date only
  - Set "To" date only
  - Set both "From" and "To" dates
  - Test with batches that have no delivery date

- Created Date Range:
  - Set "From" date only
  - Set "To" date only
  - Set both "From" and "To" dates

**Expected Results:**
- Date filters should work independently
- Batches without the specified date should be excluded when filter is active
- Date ranges should be inclusive (include the boundary dates)
- "To" date should include the entire day (until 23:59:59)

### 4. Combined Filters

**Test Steps:**
1. Apply multiple filters simultaneously
2. Verify results are correctly filtered

**Test Cases:**
- Text search + date preset
- Text search + custom date filters
- Multiple custom date filters
- All filters combined

**Expected Results:**
- All filters should work together (AND logic)
- Results should be the intersection of all active filters
- Clear all filters should reset everything

### 5. Filter Status Display

**Test Steps:**
1. Apply various filters
2. Check the status display in the header

**Expected Results:**
- Should show "X batches selected" (from barcode selection)
- Should show "X of Y batches shown" when filters are active
- Should show total barcode count when batches are selected

### 6. Edge Cases

**Test Cases:**
- Empty search results
- Invalid date inputs
- Very large date ranges
- Special characters in search terms
- Batches with missing/null dates

**Expected Results:**
- Empty results should be handled gracefully
- Invalid inputs should not break the application
- Performance should remain good with large datasets

## Manual Testing Checklist

- [ ] Text search works for all fields (product name, batch number, product code, supplier)
- [ ] Text search is case-insensitive
- [ ] Text search supports partial matching
- [ ] Clear search button (X) works
- [ ] Date presets work correctly
- [ ] Custom date filters appear when "Custom" is selected
- [ ] Date filters work for expiry, delivery, and created dates
- [ ] Batches without dates are handled correctly
- [ ] Multiple filters work together
- [ ] Clear all filters button resets everything
- [ ] Filter status is displayed correctly
- [ ] Performance is acceptable with large datasets
- [ ] No console errors during filtering

## Automated Testing

Run the test file: `app/(back-office)/dashboard/inventory/batches/print-barcodes/page.test.tsx`

```bash
npm test -- --testPathPattern=page.test.tsx
```

## Common Issues to Check

1. **Date Format Issues**: Ensure dates are parsed correctly from the database
2. **Null/Undefined Handling**: Check that batches without dates are handled properly
3. **Performance**: Large datasets should filter quickly
4. **State Management**: Filters should persist during component re-renders
5. **Accessibility**: Filter controls should be keyboard accessible
6. **Mobile Responsiveness**: Filters should work on mobile devices

## Debugging Tips

1. **Console Logs**: Add console.log to the filtering logic to debug issues
2. **React DevTools**: Use React DevTools to inspect component state
3. **Network Tab**: Check if data is being fetched correctly
4. **Local Storage**: Verify that selections persist correctly
5. **Date Objects**: Use browser dev tools to inspect date objects 