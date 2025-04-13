// types/next-utils.d.ts
import type { Document, Types } from "mongoose";

// Currency interface to match the schema
interface ICurrency {
  cny: number;
  usd: number;
  bdt: number;
}

// Order Product interface for items in an order
interface IOrderProduct {
  product: ProductType;
  title: string;
  sku: string;
  color?: string;
  size?: string;
  quantity: number;
  unitPrice: ICurrency;
  totalPrice: ICurrency;
}

// Transaction interface for payment details
interface ITransaction {
  amount: ICurrency;
  transactionId: string;
  paymentDate: Date;
  receiptUrl?: string;
  notes?: string;
}

// Tracking history entry interface
interface ITrackingEntry {
  status: string;
  timestamp: Date;
  location?: string;
  notes?: string;
}

// Note interface for order notes
interface INote {
  text: string;
  createdBy: string;
  isInternal: boolean;
  createdAt: Date;
}

// Updated OrderType to match the MongoDB schema
interface OrderType extends Document {
  orderId: string;
  customerId: Types.ObjectId;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
    customerType: "regular" | "wholesale" | "vip";
  };
  products: IOrderProduct[];
  currencyRates: {
    usdToBdt: number;
    cnyToBdt: number;
  };
  shippingAddress: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  contactInformation: {
    email?: string;
    phone?: string;
  };
  shippingMethod: string; // "air" or "sea"
  deliveryType: string; // "door-to-door" or "warehouse"
  shippingRate: ICurrency;
  totalDiscount: ICurrency;
  totalAmount: ICurrency;
  subTotal: ICurrency;
  estimatedDeliveryDate?: Date;
  paymentMethod: string; // "cash" or "card"
  paymentCurrency: "CNY" | "USD" | "BDT";
  paymentDetails: {
    status:
      | "pending"
      | "paid"
      | "failed"
      | "refunded"
      | "partially_refunded"
      | "partially_paid";
    transactions: ITransaction[];
  };
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "in-transit"
    | "out-for-delivery"
    | "delivered"
    | "canceled"
    | "returned";
  trackingHistory: ITrackingEntry[];
  notes: INote[];
  metadata: {
    source?: string;
    tags?: string[];
    campaign?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Updated OrderItem interface for use in the OrdersPage component
interface OrderItem {
  _id?: string;
  orderId?: string;
  products: IOrderProduct[];
  customer?: {
    name: string;
    email?: string;
    phone?: string;
    customerType?: string;
  };
  totalAmount: ICurrency;
  unitPrice: {
    bdt: number;
  };
  quantity?: number;
  status: string;
  shippingMethod?: string;
  deliveryType?: string;
  estimatedDeliveryDate?: Date;
  createdAt: Date | number | string;
  trackingHistory?: ITrackingEntry[];
  unitPrice: {
    bdt: number;
  };
}

// Other existing interfaces remain the same
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
  customerId: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  orders?: Types.ObjectId[];
  status?: "active" | "inactive";
  customerType?: "regular" | "wholesale" | "vip";
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
  currency: "BDT" | "USD";
  category: {
    name: string;
    subcategories: {
      name: string;
    }[];
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
  subcategories?: string[];
  tags?: string[];
  sizes?: string[];
  colors?: string[];
  inputCurrency?: string;
  minimumOrderQuantity?: number;
  quantityPricing?: {
    ranges: Array<{
      minQuantity: number;
      maxQuantity: number;
      price: {
        bdt: number;
        cny: number;
        usd: number;
      };
    }>;
  };
  currencyRates?: {
    usdToBdt: number;
    cnyToBdt: number;
  };
}

// Updated ProductInfoType to better match the schema
interface ProductInfoType {
  _id: string;
  product?: ProductType;
  sku: string;
  slug?: string;
  title?: string;
  name?: string;
  description?: string;
  price?: {
    bdt: number;
    cny: number;
    usd: number;
  };
  color?: string;
  size?: string;
  quantity: number;
  unitPrice?: ICurrency;
  totalPrice?: ICurrency;
  expense?: {
    bdt: number;
    cny: number;
    usd: number;
  };
  media?: string[];
  category?:
    | {
        name: string;
      }
    | string[];
  tags?: string[];
  sizes?: string[];
  colors?: string[];
  createdAt?: string;
  updatedAt?: string;
  minimumOrderQuantity?: number;
  inputCurrency?: string;
  quantityPricing?: {
    ranges: [];
  };
  currencyRates?: {
    usdToBdt: number;
    cnyToBdt: number;
  };
  quantity: number;
}

interface UserType extends Document {
  userId: string;
  name: string;
  email: string;
  image: string;
  password: string;
  role: "user" | "admin" | "super_admin";
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
  orders?: Types.ObjectId[];
  wishlist: Types.ObjectId[];
}

interface CollectionType {
  _id: string;
  name: string;
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  thumbnail?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
