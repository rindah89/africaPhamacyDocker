# Insurance Claims Actions Implementation

## Overview
This document describes the implemented actions for managing insurance claims in the ClaimsTab component.

## Features Implemented

### 1. Confirmation Dialogs ✅
- **ConfirmationDialog.tsx**: Reusable confirmation dialog component
- **No more browser alerts**: Replaced `window.alert()` with proper React AlertDialog
- **Detailed descriptions**: Clear explanations of what each action does
- **Visual feedback**: Icons and proper styling for different actions

### 2. Claim Status Actions ✅

#### Mark as Submitted
- **Available for**: PENDING claims
- **Action**: Updates status from PENDING → SUBMITTED
- **Effects**: 
  - Sets `processedDate` to current date
  - Indicates claim has been processed and sent to insurance provider
  - Can be reversed by marking as paid later

#### Mark as Paid
- **Available for**: SUBMITTED claims
- **Action**: Updates status from SUBMITTED → PAID
- **Effects**: 
  - Sets `paidDate` to current date
  - Indicates insurance provider has processed payment
  - This is typically the final status for a claim

#### View Order
- **Available for**: Claims with linked orders
- **Action**: Opens OrderDetailsDialog showing complete order information
- **Features**: 
  - Order summary with total, status, payment method
  - Customer information
  - Detailed order items with quantities and prices
  - All amounts displayed in XAF (Cameroonian Francs)

### 3. Data Refresh System ✅
- **Server-side refresh**: Uses `revalidatePath()` in server actions
- **No page reload**: Automatic data refresh without full page reload
- **Optional callback**: `onDataChange` prop for custom refresh logic
- **Fallback handling**: Graceful error handling with user feedback

### 4. User Experience Improvements ✅

#### Visual Feedback
- **Loading states**: Disabled buttons during processing
- **Toast notifications**: Success/error messages with specific details
- **Color coding**: Blue for submitted, green for paid actions
- **Icons**: Clear visual indicators for each action type

#### Accessibility
- **Keyboard navigation**: Full keyboard support for all dialogs
- **Screen reader support**: Proper ARIA labels and descriptions
- **Focus management**: Proper focus handling in dialogs

## Usage

### In ClaimsTab Component
```tsx
<ClaimsTab 
  claims={claims} 
  onDataChange={optionalRefreshCallback} 
/>
```

### Action Flow
1. User clicks action button (⋯) in claims table
2. Dropdown menu shows available actions based on claim status
3. User selects action (e.g., "Mark as Submitted")
4. Confirmation dialog appears with detailed explanation
5. User confirms or cancels
6. If confirmed, server action executes
7. Success/error feedback shown
8. Data automatically refreshes

## Technical Implementation

### Server Actions
- **updateClaimStatus**: Updates claim status in database
- **getOrderByNumber**: Fetches order details for viewing
- **Automatic revalidation**: `revalidatePath()` refreshes page data

### Client Components
- **ClaimsTab**: Main claims management interface
- **ConfirmationDialog**: Reusable confirmation modal
- **OrderDetailsDialog**: Order viewing modal

### Error Handling
- **Try-catch blocks**: Proper error catching and logging
- **User feedback**: Clear error messages for users
- **Console logging**: Detailed logs for debugging
- **Graceful fallbacks**: System continues working if actions fail

## Configuration

### Currency
All amounts are displayed in **XAF (Central African Francs)** with proper locale formatting for Cameroon (`fr-CM`).

### Status Flow
```
PENDING → [Mark as Submitted] → SUBMITTED → [Mark as Paid] → PAID
```

## Future Enhancements
- Bulk status updates for multiple claims
- Claim reversal actions (PAID → SUBMITTED)
- Audit trail for status changes
- Email notifications for status updates
- Export claims to PDF for submission 