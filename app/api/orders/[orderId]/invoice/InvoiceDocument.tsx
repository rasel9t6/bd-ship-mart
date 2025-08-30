import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Document as MongooseDocument } from 'mongoose';

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

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  companyInfo: {
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 5,
    textDecoration: 'underline',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    height: 24,
    fontSize: 10,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    height: 24,
    fontSize: 10,
    fontWeight: 'bold',
  },
  col1: {
    width: '20%',
  },
  col2: {
    width: '30%',
  },
  col3: {
    width: '15%',
  },
  col4: {
    width: '17.5%',
  },
  col5: {
    width: '17.5%',
  },
  totals: {
    marginTop: 20,
    textAlign: 'right',
  },
});

interface InvoiceDocumentProps {
  order: OrderDocument;
}

const InvoiceDocument = ({ order }: InvoiceDocumentProps) => (
  <Document>
    <Page
      size='A4'
      style={styles.page}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Invoice</Text>
      </View>

      <View style={styles.companyInfo}>
        <Text>K2B EXPRESS</Text>
        <Text>123 Business Street</Text>
        <Text>Dhaka, Bangladesh</Text>
      </View>

      <View style={styles.section}>
        <Text>Order ID: {order.orderId}</Text>
        <Text>Date: {new Date(order.createdAt).toLocaleDateString()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bill To:</Text>
        <Text>{order.customerInfo.name || 'N/A'}</Text>
        <Text>{order.customerInfo.email || 'N/A'}</Text>
        {order.shippingAddress && (
          <>
            <Text>{order.shippingAddress.street}</Text>
            <Text>
              {order.shippingAddress.city}, {order.shippingAddress.state}
            </Text>
            <Text>
              {order.shippingAddress.postalCode},{' '}
              {order.shippingAddress.country}
            </Text>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items:</Text>
        <View style={styles.headerRow}>
          <Text style={styles.col1}>Item</Text>
          <Text style={styles.col2}>Color/Size</Text>
          <Text style={styles.col3}>Quantity</Text>
          <Text style={styles.col4}>Unit Price</Text>
          <Text style={styles.col5}>Total</Text>
        </View>

        {order.products.map(
          (
            product: {
              product: string;
              color: string[];
              size: string[];
              quantity: number;
              unitPrice: { bdt: number };
              totalPrice: { bdt: number };
            },
            index: number
          ) => (
            <View
              key={index}
              style={styles.row}
            >
              <Text style={styles.col1}>{product.product.toString()}</Text>
              <Text style={styles.col2}>
                {product.color.join(', ')} / {product.size.join(', ')}
              </Text>
              <Text style={styles.col3}>{product.quantity}</Text>
              <Text style={styles.col4}>{product.unitPrice.bdt} BDT</Text>
              <Text style={styles.col5}>{product.totalPrice.bdt} BDT</Text>
            </View>
          )
        )}
      </View>

      <View style={styles.totals}>
        <Text>
          Subtotal:{' '}
          {order.subTotal?.bdt ??
            order.products.reduce(
              (sum, product) => sum + (product.totalPrice?.bdt || 0),
              0
            )}{' '}
          BDT
        </Text>
        <Text>Shipping: {order.shippingRate?.bdt || 0} BDT</Text>
        <Text>
          Total Amount:{' '}
          {(() => {
            const subtotal =
              order.subTotal?.bdt ??
              order.products.reduce(
                (sum, product) => sum + (product.totalPrice?.bdt || 0),
                0
              );
            const shipping = order.shippingRate?.bdt || 0;
            return order.totalAmount?.bdt ?? subtotal + shipping;
          })()}{' '}
          BDT
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Information:</Text>
        <Text>Payment Method: {order.paymentMethod}</Text>
        <Text>Payment Currency: {order.paymentCurrency}</Text>
        <Text>Payment Status: {order.paymentDetails.status}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Information:</Text>
        <Text>Shipping Method: {order.shippingMethod}</Text>
        <Text>Delivery Type: {order.deliveryType}</Text>
        <Text>
          Estimated Delivery:{' '}
          {order.estimatedDeliveryDate?.toLocaleDateString() || 'N/A'}
        </Text>
      </View>
    </Page>
  </Document>
);

export default InvoiceDocument;
