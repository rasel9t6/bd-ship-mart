import { Order } from './types';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'confirmed':
      return 'secondary';
    case 'processing':
      return 'info';
    case 'shipped':
      return 'secondary';
    case 'in-transit':
      return 'secondary';
    case 'out-for-delivery':
      return 'primary';
    case 'delivered':
      return 'success';
    case 'canceled':
    case 'returned':
      return 'destructive';
    default:
      return 'default';
  }
};

export const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatAddress = (shippingAddress: Order['shippingAddress']) => {
  if (!shippingAddress) return 'No shipping address provided';

  const parts = [
    shippingAddress.street,
    shippingAddress.city,
    shippingAddress.state,
    shippingAddress.postalCode,
    shippingAddress.country,
  ].filter(Boolean); // Remove undefined/null values

  return parts.length > 0 ? parts.join(', ') : 'No shipping address provided';
};

// Calculate subtotal from products if subTotal is not available
export const calculateSubTotal = (order: Order, currency: string) => {
  if (
    order.subTotal &&
    order.subTotal[currency.toLowerCase() as keyof typeof order.subTotal]
  ) {
    return order.subTotal[
      currency.toLowerCase() as keyof typeof order.subTotal
    ];
  }

  // Fallback: calculate from products
  return order.products.reduce((sum, product) => {
    const price =
      product.totalPrice?.[
        currency.toLowerCase() as keyof typeof product.totalPrice
      ] ?? 0;
    return sum + price;
  }, 0);
};

// Calculate total amount if totalAmount is not available
export const calculateTotalAmount = (order: Order, currency: string) => {
  if (
    order.totalAmount &&
    order.totalAmount[currency.toLowerCase() as keyof typeof order.totalAmount]
  ) {
    return order.totalAmount[
      currency.toLowerCase() as keyof typeof order.totalAmount
    ];
  }

  // Fallback: calculate from subtotal
  const subTotal = calculateSubTotal(order, currency);
  const shippingRate =
    order.shippingRate?.[
      currency.toLowerCase() as keyof typeof order.shippingRate
    ] ?? 0;
  // Note: totalDiscount might not exist in all order types, so we default to 0
  const totalDiscount = 0;

  return subTotal + shippingRate - totalDiscount;
};

// Helper function to safely get product information
export const getProductInfo = (product: any) => {
  if (typeof product === 'string') {
    return {
      name: 'Product (ID: ' + product + ')',
      title: 'Product (ID: ' + product + ')',
      sku: 'N/A',
    };
  }

  // If product is null/undefined (deleted product), show a meaningful message
  if (!product || product === null) {
    return {
      name: 'Product (Deleted)',
      title: 'Product (Deleted)',
      sku: 'N/A',
    };
  }

  return {
    name: product?.name || product?.title || 'Product',
    title: product?.title || product?.name || 'Product',
    sku: product?.sku || 'N/A',
  };
};
