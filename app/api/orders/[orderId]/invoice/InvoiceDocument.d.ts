import { Document as MongooseDocument } from "mongoose";
import React from "react";

interface OrderDocument extends MongooseDocument {
  orderId: string;
  createdAt: Date;
  customerInfo: {
    name: string;
    email: string;
  };
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  products: Array<{
    product: string;
    color: string[];
    size: string[];
    quantity: number;
    unitPrice: { bdt: number };
    totalPrice: { bdt: number };
  }>;
  subTotal: { bdt: number };
  shippingRate: { bdt: number };
  totalAmount: { bdt: number };
  paymentMethod: string;
  paymentCurrency: string;
  paymentDetails: {
    status: string;
  };
  shippingMethod: string;
  deliveryType: string;
  estimatedDeliveryDate?: Date;
}

interface InvoiceDocumentProps {
  order: OrderDocument;
}

declare const InvoiceDocument: (
  props: InvoiceDocumentProps,
) => React.ReactElement;
export default InvoiceDocument;
