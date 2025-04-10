// types/next-utils.d.ts

import type { Document, Types } from 'mongoose';
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
interface CategoryType extends Document {
  name: string;
  title: string;
  slug: string;
  description?: string;
  icon: string;
  thumbnail: string;
  subcategories: SubcategoryType[];
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

interface CustomerType extends Document {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductType extends Document {
  title: string;
  sku: string;
  description?: string;
  price: {
    bdt: number;
    cny: number;
    usd: number;
  };
  currency: 'BDT' | 'USD';
  category: {
    name: string;
    subcategories: {
      name: string;
    };
  };
  slug: string;
  priceInBDT: number;
  priceInUSD: number;
  createdAt: Date;
  updatedAt: Date;
  media: string[];
  expense: {
    bdt: number;
    cny: number;
    usd: number;
  };
}
interface ProductInfoType {
  _id: string;
  sku: string;
  slug: string;
  title?: string;
  description: string;
  price: {
    bdt: number;
    cny: number;
    usd: number;
  };
  expense: {
    bdt: number;
    cny: number;
    usd: number;
  };
  media: string[];
  category: {
    name: string;
  };
  category?: string[];
  tags: string[];
  sizes: string[];
  colors: string[];
  createdAt?: string;
  updatedAt?: string;
  minimumOrderQuantity: number;
  inputCurrency: string;
  quantityPricing: {
    ranges: string[];
  };
  currencyRates: {
    usdToBdt: number;
    cnyToBdt: number;
  };
}
interface OrderItem {
  product: Types.ObjectId;
  quantity: number;
  _id: string;
  title: string;
}

interface OrderType extends Document {
  customerId: Types.ObjectId;
  items: OrderItem[];
  totalAmount: number;
  currency: 'BDT' | 'USD';
  totalInBDT: number;
  totalInUSD: number;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  total: number;
}

interface UserType extends Document {
  userId: string;
  name: string;
  email: string;
  image: string;
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
  updatedAt: Date;
}
