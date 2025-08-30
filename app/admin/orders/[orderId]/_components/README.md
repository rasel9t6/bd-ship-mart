# Order Detail Components

This directory contains the refactored, modular components for the OrderDetailPage. The original monolithic component has been broken down into smaller, more manageable pieces for better maintainability and reusability.

## Component Structure

### Main Components

- **`page.tsx`** - Main page component that orchestrates all sub-components
- **`types.ts`** - Type definitions for Order, OrderProduct, Transaction, etc.
- **`useOrder.ts`** - Custom hook for order logic and state management
- **`utils.ts`** - Utility functions for formatting and status colors

### UI Components

- **`OrderHeader.tsx`** - Order header with navigation and action buttons
- **`OrderSummary.tsx`** - Order summary card with status and update buttons
- **`CustomerInfo.tsx`** - Customer information and shipping address
- **`OrderItems.tsx`** - Order items table with pricing breakdown
- **`TrackingHistory.tsx`** - Tracking history timeline
- **`PaymentTransactions.tsx`** - Payment transactions table
- **`OrderNotes.tsx`** - Order notes section
- **`Loading.tsx`** - Loading state component

## Benefits of Refactoring

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Components can be reused in other order-related pages
3. **Maintainability**: Easier to debug and modify specific functionality
4. **Readability**: Smaller components are easier to understand
5. **Testing**: Individual components can be tested in isolation
6. **Performance**: Better code splitting and potential for optimization

## Usage

```tsx
import {
  OrderHeader,
  OrderSummary,
  CustomerInfo,
  OrderItems,
  TrackingHistory,
  PaymentTransactions,
  OrderNotes,
  Loading,
  useOrder,
} from './_components';

// Use the main page component
<OrderDetailPage params={params} />;
```

## Component Dependencies

- All components use the shared `Order` type from `types.ts`
- Components are designed to work with the `useOrder` hook
- Utility functions are shared across components for consistency

## Page Structure

The page follows this hierarchy:

- Order Header (navigation + actions)
- Order Summary + Customer Info (2-column grid)
- Order Items (table)
- Tracking History (timeline)
- Payment Transactions (table, conditional)
- Order Notes (conditional)

## State Management

The `useOrder` hook manages:

- Order data fetching
- Loading states
- Status updates
- Error handling
- Navigation

## Conditional Rendering

Some components (`PaymentTransactions`, `OrderNotes`) only render when there's data to display, keeping the UI clean and focused.
