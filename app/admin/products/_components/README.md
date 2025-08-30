# Product Form Components

This directory contains the refactored, modular components for the ProductForm. The original monolithic component has been broken down into smaller, more manageable pieces for better maintainability and reusability.

## Component Structure

### Main Components

- **`ProductForm.tsx`** - Main container component that orchestrates all sub-components
- **`types.ts`** - Type definitions and Zod validation schemas
- **`useProductForm.ts`** - Custom hook for form logic and state management

### Form Sections

- **`ProductBasicInfo.tsx`** - Basic product fields (title, description, SKU)
- **`CategorySelection.tsx`** - Category and subcategory selection with search
- **`CurrencyRates.tsx`** - Currency rate configuration (CNY/USD to BDT)
- **`PricingSection.tsx`** - Pricing and expense inputs with currency conversion
- **`ProductDetails.tsx`** - Product details (media, colors, sizes, tags)
- **`QuantityPricing.tsx`** - Quantity-based pricing ranges
- **`FormActions.tsx`** - Form submission and cancel buttons

## Benefits of Refactoring

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Components can be reused in other product-related forms
3. **Maintainability**: Easier to debug and modify specific functionality
4. **Readability**: Smaller components are easier to understand
5. **Testing**: Individual components can be tested in isolation
6. **Performance**: Better code splitting and potential for optimization

## Usage

```tsx
import { ProductForm } from './_components';

// Use the main form component
<ProductForm initialData={productData} />;
```

## Component Dependencies

- All components use the shared `FormValues` type from `types.ts`
- Components are designed to work with the `useProductForm` hook
- Form validation is handled by Zod schemas

## Form Structure

The form follows this logical grouping:

1. **Basic Information** - Title, description, SKU
2. **Categorization** - Categories and subcategories
3. **Currency Configuration** - Exchange rates
4. **Pricing** - Price and expense with automatic conversion
5. **Product Details** - Media, variants, specifications
6. **Quantity Pricing** - Bulk pricing options
7. **Actions** - Submit and cancel buttons

## State Management

The `useProductForm` hook manages:

- Form initialization and validation
- Category and subcategory data fetching
- Currency conversion logic
- Form submission and error handling
- Loading states

## Currency Conversion

The form automatically handles currency conversion between:

- CNY (Chinese Yuan)
- USD (US Dollar)
- BDT (Bangladeshi Taka)

Rates are configurable and conversions happen in real-time as users input values.

## Media Handling

- **Product Media**: Single image upload for main product image
- **Color Variants**: Multiple image/video uploads for product variants
- **File Organization**: Organized into `products` and `products/variants` folders

## Quantity Pricing

Optional bulk pricing system that allows:

- Setting minimum/maximum quantity ranges
- Different pricing for different quantity tiers
- Automatic currency conversion for all pricing tiers
