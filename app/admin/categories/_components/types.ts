import { z } from 'zod';

// Types matching MongoDB Schema
export type Subcategory = {
  shippingCharge: {
    byAir: { min: number; max: number };
    bySea: { min: number; max: number };
  };
  name: string;
  slug: string;
  title: string;
  description?: string;
  icon?: string;
  thumbnail?: string;
  isActive: boolean;
  sortOrder: number;
  category: string;
};

export interface CategoryFormProps {
  initialData?: {
    shippingCharge: {
      byAir: { min: number; max: number };
      bySea: { min: number; max: number };
    };
    _id: string;
    slug: string;
    name: string;
    title: string;
    description?: string;
    icon: string;
    thumbnail: string;
    isActive: boolean;
    sortOrder: number;
    subcategories: Subcategory[];
  } | null;
}

// Schemas matching MongoDB requirements
export const subcategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  thumbnail: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  category: z.string().optional(),
  shippingCharge: z
    .object({
      byAir: z.object({
        min: z
          .number()
          .min(0, 'Min shipping charge must be positive')
          .default(0),
        max: z
          .number()
          .min(0, 'Max shipping charge must be positive')
          .default(0),
      }),
      bySea: z.object({
        min: z
          .number()
          .min(0, 'Min shipping charge must be positive')
          .default(0),
        max: z
          .number()
          .min(0, 'Max shipping charge must be positive')
          .default(0),
      }),
    })
    .default({
      byAir: { min: 0, max: 0 },
      bySea: { min: 0, max: 0 },
    }),
});

export const formSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  icon: z.string().min(1, 'Icon is required'),
  thumbnail: z.string().min(1, 'Thumbnail is required'),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  shippingCharge: z
    .object({
      byAir: z.object({
        min: z
          .number()
          .min(0, 'Min shipping charge must be positive')
          .default(0),
        max: z
          .number()
          .min(0, 'Max shipping charge must be positive')
          .default(0),
      }),
      bySea: z.object({
        min: z
          .number()
          .min(0, 'Min shipping charge must be positive')
          .default(0),
        max: z
          .number()
          .min(0, 'Max shipping charge must be positive')
          .default(0),
      }),
    })
    .default({
      byAir: { min: 0, max: 0 },
      bySea: { min: 0, max: 0 },
    }),
  subcategories: z.array(subcategorySchema).default([]),
});

export type FormValues = z.infer<typeof formSchema>;
