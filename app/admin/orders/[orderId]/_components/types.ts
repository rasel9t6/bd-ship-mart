// Define types based on your Order schema
export type Currency = {
  cny: number;
  usd: number;
  bdt: number;
};

export type OrderProduct = {
  product:
    | {
        _id: string;
        name: string;
        title: string;
        sku: string;
        images: string[];
      }
    | string;
  color: string[];
  size: string[];
  quantity: number;
  unitPrice: Currency;
  totalPrice: Currency;
};

export type Transaction = {
  amount: Currency;
  transactionId: string;
  paymentDate: Date;
  receiptUrl: string;
  notes: string;
};

export type TrackingEvent = {
  status: string;
  timestamp: Date;
  location: string;
  notes: string;
};

export type Order = {
  _id: string;
  orderId: string;
  customerInfo: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    customerType: 'regular' | 'wholesale' | 'vip';
  };
  products: OrderProduct[];
  currencyRates: {
    usdToBdt: number;
    cnyToBdt: number;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  shippingMethod: string;
  deliveryType: string;
  shippingRate: Currency;
  totalDiscount: Currency;
  totalAmount: Currency;
  subTotal: Currency;
  estimatedDeliveryDate: Date;
  paymentMethod: string;
  paymentCurrency: 'CNY' | 'USD' | 'BDT';
  paymentDetails: {
    status:
      | 'pending'
      | 'paid'
      | 'failed'
      | 'refunded'
      | 'partially_refunded'
      | 'partially_paid';
    transactions: Transaction[];
  };
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'in-transit'
    | 'out-for-delivery'
    | 'delivered'
    | 'canceled'
    | 'returned';
  trackingHistory: TrackingEvent[];
  notes: {
    text: string;
    createdBy: string;
    isInternal: boolean;
    createdAt: Date;
  }[];
  metadata: {
    source: string;
    tags: string[];
    campaign: string;
  };
  createdAt: Date;
  updatedAt: Date;
};
