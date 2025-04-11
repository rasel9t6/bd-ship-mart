import mongoose, { Schema } from 'mongoose';
import toast from 'react-hot-toast';

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

// Currency Interface to match Product model
interface ICurrency {
  cny: number;
  usd: number;
  bdt: number;
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
  title: string;
  sku: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: ICurrency;
  totalPrice: ICurrency;
}

const OrderProductSchema = new Schema<IOrderProduct>(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
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
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true,
    set: function (customerId: string) {
      toast.success(`Customer ${customerId} updated with order ${this._id}`);
      return customerId;
    },
  },
  customerInfo: {
    name: String,
    email: String,
    phone: String,
    customerType: {
      type: String,
      enum: ['regular', 'wholesale', 'vip'],
    },
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
  contactInformation: {
    email: String,
    phone: String,
  },
  shippingMethod: String, // "air" or "sea"
  deliveryType: String, // "door-to-door" or "warehouse"
  shippingRate: {
    type: CurrencySchema,
    default: { cny: 0, usd: 0, bdt: 0 },
  },
  totalDiscount: {
    type: CurrencySchema,
    default: { cny: 0, usd: 0, bdt: 0 },
  },
  totalAmount: {
    type: CurrencySchema,
    default: { cny: 0, usd: 0, bdt: 0 },
  },
  subTotal: {
    type: CurrencySchema,
    default: { cny: 0, usd: 0, bdt: 0 },
  },
  estimatedDeliveryDate: Date,
  paymentMethod: String, // "cash" or "card"
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

// Hooks for updating customer orders
orderSchema.post('save', async function (doc) {
  try {
    const Customer = mongoose.model('Customer');
    await Customer.findByIdAndUpdate(doc.customerId, {
      $addToSet: { orders: doc._id },
      updatedAt: new Date(),
    });
    console.log(`✅ Customer ${doc.customerId} updated with order ${doc._id}`);
  } catch (error) {
    console.error('❌ Error updating Customer with order:', error);
  }
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
