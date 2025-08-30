import { z } from 'zod';

// Form schema for validation
export const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  subcategories: z.array(z.string()).optional(),
  inputCurrency: z.enum(['CNY', 'USD']),
  price: z.object({
    cny: z.number().min(0).optional(),
    usd: z.number().min(0).optional(),
    bdt: z.number().min(0).optional(),
  }),
  expense: z.object({
    cny: z.number().min(0).optional(),
    usd: z.number().min(0).optional(),
    bdt: z.number().min(0).optional(),
  }),
  currencyRates: z.object({
    usdToBdt: z.number().min(0),
    cnyToBdt: z.number().min(0),
  }),
  minimumOrderQuantity: z.number().min(1),
  media: z.array(
    z.object({
      url: z.string().url(),
      type: z.enum(['image']),
    })
  ),
  colors: z.array(
    z.object({
      url: z.string().url(),
      type: z.enum(['image', 'video']),
    })
  ),
  sizes: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  quantityPricing: z.object({
    ranges: z
      .array(
        z.object({
          minQuantity: z.number().min(1),
          maxQuantity: z.number().min(1).optional(),
          price: z.object({
            cny: z.number().min(0).optional(),
            usd: z.number().min(0).optional(),
            bdt: z.number().min(0).optional(),
          }),
        })
      )
      .optional(),
  }),
});

export type FormValues = z.infer<typeof formSchema>;

export interface Subcategory {
  _id: string;
  name: string;
  title: string;
  description?: string;
  shippingCharge: {
    byAir: { min: number; max: number };
    bySea: { min: number; max: number };
  };
  icon: string;
  thumbnail: string;
  products: string[];
  category: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  slug: string;
}

export interface Category {
  _id: string;
  name: string;
  title: string;
  description?: string;
  subcategories: Subcategory[];
  products: string[];
  shippingCharge: {
    byAir: { min: number; max: number };
    bySea: { min: number; max: number };
  };
  isActive: boolean;
  sortOrder: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  slug: string;
}

export interface ProductFormType {
  _id: string;
  title: string;
  description?: string;
  sku: string;
  slug?: string;
  categories: string[];
  subcategories: string[];
  inputCurrency: 'CNY' | 'USD';
  price: {
    cny?: number;
    usd?: number;
    bdt?: number;
  };
  expense: {
    cny?: number;
    usd?: number;
    bdt?: number;
  };
  currencyRates: {
    usdToBdt: number;
    cnyToBdt: number;
  };
  minimumOrderQuantity: number;
  media: MediaItem[];
  colors?: MediaItem[];
  tags?: string[];
  sizes?: string[];
  quantityPricing?: {
    ranges: Array<{
      minQuantity: number;
      maxQuantity?: number;
      price: {
        cny?: number;
        usd?: number;
        bdt?: number;
      };
    }>;
  };
}

export interface MediaItem {
  url: string;
  type: 'image';
}

export interface Props {
  initialData?: ProductFormType;
}
