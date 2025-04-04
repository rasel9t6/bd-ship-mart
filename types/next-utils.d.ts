// types/next-utils.d.ts

import type { Document, Types } from 'mongoose';

interface CategoryType extends Document {
  name: string;
  title: string;
  slug: string;
  description?: string;
  icon: string;
  thumbnail: string;
  subcategories: Types.ObjectId[];
  products: Types.ObjectId[];
  shippingCharge?: {
    byAir?: {
      min?: number;
      max?: number;
    };
    bySea?: {
      min?: number;
      max?: number;
    };
  };
  isActive: boolean;
  sortOrder: number;
  metadata: Map<string, string>;
  createdAt: Date;
  updatedAt: Date;
}
interface SubcategoryType extends Document {
  name: string;
  title: string;
  slug: string;
  description?: string;
  shippingCharge?: {
    byAir?: {
      min?: number;
      max?: number;
    };
    bySea?: {
      min?: number;
      max?: number;
    };
  };
  icon?: string;
  thumbnail?: string;
  products: Types.ObjectId[];
  category: Types.ObjectId;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
interface CustomerType extends Document {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductType extends Document {
  name: string;
  description?: string;
  price: number;
  currency: 'BDT' | 'USD';
  category: Types.ObjectId;
  slug: string;
  priceInBDT: number;
  priceInUSD: number;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItem {
  product: Types.ObjectId;
  quantity: number;
}

interface OrderType extends Document {
  customer: Types.ObjectId;
  items: OrderItem[];
  totalAmount: number;
  currency: 'BDT' | 'USD';
  totalInBDT: number;
  totalInUSD: number;
  createdAt: Date;
  updatedAt: Date;
}

interface UserType extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'super_admin';
  profilePicture?: string | null;
  phone?: string | null;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emailVerified: boolean;
  verificationToken?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  createdAt: Date;
}
