# Category Form Components

This directory contains the refactored, modular components for the CategoryForm. The original monolithic component has been broken down into smaller, more manageable pieces for better maintainability and reusability.

## Component Structure

### Main Components

- **`CategoryForm.tsx`** - Main container component that orchestrates all sub-components
- **`types.ts`** - Type definitions and Zod validation schemas
- **`useCategoryForm.ts`** - Custom hook for form logic and state management

### Form Sections

- **`CategoryBasicInfo.tsx`** - Basic category fields (name, title, description)
- **`ShippingChargeSection.tsx`** - Shipping charge inputs for air and sea
- **`MediaUploadSection.tsx`** - Icon and thumbnail upload components
- **`CategorySettings.tsx`** - Sort order and active status settings

### Subcategory Management

- **`SubcategoriesSection.tsx`** - Manages the subcategories section with add/remove functionality
- **`SubcategoryForm.tsx`** - Individual subcategory form component

## Benefits of Refactoring

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Components can be reused in other forms
3. **Maintainability**: Easier to debug and modify specific functionality
4. **Readability**: Smaller components are easier to understand
5. **Testing**: Individual components can be tested in isolation
6. **Performance**: Better code splitting and potential for optimization

## Usage

```tsx
import { CategoryForm } from './_components';

// Use the main component
<CategoryForm initialData={categoryData} />;
```

## Component Dependencies

- All components use React Hook Form for form management
- Components are designed to work with the shared `FormValues` type
- The `prefix` prop allows components to work with nested form fields (e.g., subcategories)

## Form Structure

The form follows this hierarchy:

- Category (main form)
  - Basic Info
  - Shipping Charges
  - Media Uploads
  - Settings
  - Subcategories (array)
    - Basic Info
    - Media Uploads
    - Shipping Charges
    - Settings
