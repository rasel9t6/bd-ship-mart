import mongoose, { Schema } from 'mongoose';

function generateSequentialNumber() {
  return Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
}

function generateOrderId() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2); // Last 2 digits of year
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const sequential = generateSequentialNumber();
  // Format: BSM-ORD-DD-MM-YY-XXXX
  return `BSM-ORD-${day}-${month}-${year}-${sequential}`;
}

// Currency Schema to match Product model
const CurrencySchema = new Schema(
  {
    cny: {
      type: Number,
      min: [0, 'Value cannot be negative'],
      default: 0,
    },
    usd: {
      type: Number,
      min: [0, 'Value cannot be negative'],
      default: 0,
    },
    bdt: {
      type: Number,
      min: [0, 'Value cannot be negative'],
      default: 0,
    },
  },
  { _id: false }
);

interface IOrderProduct {
  product: mongoose.Types.ObjectId;
  color: string[];
  size: string[];
  quantity: number;
  unitPrice: {
    cny: number;
    usd: number;
    bdt: number;
  };
  totalPrice: {
    cny: number;
    usd: number;
    bdt: number;
  };
}

const OrderProductSchema = new Schema<IOrderProduct>(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    color: { type: [String], required: true },
    size: { type: [String], required: true },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    unitPrice: CurrencySchema,
    totalPrice: CurrencySchema,
  },
  { _id: false }
);

// Main Order Schema
const orderSchema = new Schema({
  orderId: {
    type: String,
    unique: true,
    default: generateOrderId,
    index: true,
  },
  customerInfo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true,
  },
  products: [OrderProductSchema],
  currencyRates: {
    usdToBdt: { type: Number, required: true, default: 121.5 },
    cnyToBdt: { type: Number, required: true, default: 17.5 },
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  shippingMethod: String,
  deliveryType: String,
  shippingRate: CurrencySchema,
  estimatedDeliveryDate: Date,
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bkash'],
    required: true,
  },
  paymentCurrency: {
    type: String,
    enum: ['CNY', 'USD', 'BDT'],
    default: 'BDT',
  },
  paymentDetails: {
    status: {
      type: String,
      enum: [
        'pending',
        'paid',
        'failed',
        'refunded',
        'partially_refunded',
        'partially_paid',
        'cancelled',
      ],
      default: 'pending',
    },
    transactions: [
      {
        amount: CurrencySchema,
        transactionId: String,
        paymentDate: Date,
        receiptUrl: String,
        notes: String,
        // bKash specific fields
        bkash: {
          paymentID: String,
          merchantInvoiceNumber: String,
          customerMsisdn: String,
          trxID: String,
          status: {
            type: String,
            enum: ['INITIATED', 'COMPLETED', 'FAILED', 'CANCELLED'],
          },
          statusCode: String,
          statusMessage: String,
          paymentExecuteTime: Date,
          currency: String,
          intent: String,
        },
      },
    ],
  },
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'in-transit',
      'out-for-delivery',
      'delivered',
      'canceled',
      'returned',
    ],
    default: 'pending',
  },
  trackingHistory: [
    {
      status: String,
      timestamp: { type: Date, default: Date.now },
      location: String,
      notes: String,
    },
  ],
  notes: [
    {
      text: String,
      createdBy: String,
      isInternal: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  metadata: {
    source: String,
    tags: [String],
    campaign: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Add index for common queries
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({
  'customerInfo.name': 'text',
  'customerInfo.email': 'text',
});
orderSchema.index({ 'products.sku': 1 });
orderSchema.index({ 'totalAmount.bdt': 1 });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
