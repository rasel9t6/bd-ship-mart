'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, ShoppingBag, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';

interface Order {
  _id: string;
  orderId: string;
  customerInfo: {
    _id: string;
    name: string;
    email: string;
  };
  products: Array<{
    product: {
      _id: string;
      title: string;
      images: string[];
    };
    color: string[];
    size: string[];
    quantity: number;
    unitPrice: {
      bdt: number;
      usd: number;
      cny: number;
    };
    totalPrice: {
      bdt: number;
      usd: number;
      cny: number;
    };
  }>;
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
  shippingRate: {
    bdt: number;
    usd: number;
    cny: number;
  };
  totalAmount: {
    bdt: number;
    usd: number;
    cny: number;
  };
  totalDiscount: {
    bdt: number;
    usd: number;
    cny: number;
  };
  subTotal: {
    bdt: number;
    usd: number;
    cny: number;
  };
  estimatedDeliveryDate: string;
  paymentMethod: 'cash' | 'card' | 'bkash';
  paymentCurrency: 'CNY' | 'USD' | 'BDT';
  paymentDetails: {
    status:
      | 'pending'
      | 'paid'
      | 'failed'
      | 'refunded'
      | 'partially_refunded'
      | 'partially_paid'
      | 'cancelled';
    transactions: Array<{
      amount: {
        bdt: number;
        usd: number;
        cny: number;
      };
      transactionId: string;
      paymentDate: string;
      receiptUrl: string;
      notes: string;
      bkash?: {
        paymentID: string;
        merchantInvoiceNumber: string;
        customerMsisdn: string;
        trxID: string;
        status: 'INITIATED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
        statusCode: string;
        statusMessage: string;
        paymentExecuteTime: string;
        currency: string;
        intent: string;
      };
    }>;
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
  trackingHistory: Array<{
    status: string;
    timestamp: string;
    location: string;
    notes: string;
  }>;
  notes: Array<{
    text: string;
    createdBy: string;
    isInternal: boolean;
    createdAt: string;
  }>;
  metadata: {
    source: string;
    tags: string[];
    campaign: string;
  };
  createdAt: string;
  updatedAt: string;
}

const BkashPayment: React.FC<{
  order: Order;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
}> = ({ order, onPaymentSuccess, onPaymentError }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [bkashNumber, setBkashNumber] = useState('');
  console.log(order);
  const validateForm = () => {
    if (!bkashNumber) {
      setPaymentError('Please enter your bKash number');
      return false;
    }
    if (!/^01[3-9]\d{8}$/.test(bkashNumber)) {
      setPaymentError('Please enter a valid bKash number');
      return false;
    }

    // Validate order amount according to the Order model schema
    if (!order?.totalAmount || typeof order.totalAmount !== 'object') {
      setPaymentError('Order amount information is missing');
      return false;
    }

    const { bdt } = order.totalAmount;
    if (typeof bdt !== 'number' || bdt <= 0) {
      setPaymentError('Invalid BDT amount');
      return false;
    }

    if (!order?.orderId) {
      setPaymentError('Invalid order ID');
      return false;
    }

    if (!order?.paymentCurrency) {
      setPaymentError('Invalid payment currency');
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    try {
      setPaymentError(null);

      if (!validateForm()) {
        return;
      }

      setIsProcessing(true);

      const payload = {
        amount: {
          bdt: order.totalAmount.bdt,
          usd: order.totalAmount.usd || 0,
          cny: order.totalAmount.cny || 0,
        },
        orderId: order.orderId,
        currency: order.paymentCurrency,
        bkashNumber,
      };

      console.log('Payment request payload:', payload);

      const response = await fetch('/api/payment/bkash/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (
          data.message?.includes(
            'bKash payment service is not properly configured'
          )
        ) {
          throw new Error(
            'Payment service is temporarily unavailable. Please try again later.'
          );
        }
        if (data.message?.includes('Unable to authenticate with bKash')) {
          throw new Error(
            'Unable to process payment at this time. Please try again later.'
          );
        }
        throw new Error(data.message || 'Failed to create payment');
      }

      // Redirect to bKash payment page
      window.location.href = data.paymentUrl;
      onPaymentSuccess?.();
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Payment failed';
      setPaymentError(errorMessage);
      toast.error(errorMessage);
      onPaymentError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <label
          htmlFor='bkashNumber'
          className='text-sm font-medium'
        >
          bKash Number
        </label>
        <input
          type='tel'
          id='bkashNumber'
          value={bkashNumber}
          onChange={(e) => {
            setBkashNumber(e.target.value);
            setPaymentError(null);
          }}
          placeholder='01XXXXXXXXX'
          className={`w-full px-3 py-2 border rounded-md ${
            paymentError ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isProcessing}
        />
        {paymentError && (
          <p className='text-sm text-red-500 mt-1'>{paymentError}</p>
        )}
      </div>

      <div className='text-sm space-y-1 bg-gray-50 p-3 rounded-lg'>
        <div className='flex justify-between'>
          <p>Amount:</p>
          <p>৳{order.totalAmount?.bdt?.toLocaleString() || 0}</p>
        </div>
        {order.totalAmount?.usd > 0 && (
          <p className='text-gray-500 text-xs'>
            USD: ${order.totalAmount.usd.toLocaleString()}
          </p>
        )}
        {order.totalAmount?.cny > 0 && (
          <p className='text-gray-500 text-xs'>
            CNY: ¥{order.totalAmount.cny.toLocaleString()}
          </p>
        )}
      </div>

      <Button
        onClick={handlePayment}
        disabled={isProcessing || !bkashNumber}
        className='w-full'
      >
        {isProcessing ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Processing...
          </>
        ) : (
          'Pay with bKash'
        )}
      </Button>
    </div>
  );
};

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) {
      router.push('/auth/login');
      return;
    }

    const fetchPendingOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/orders/pending', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to fetch orders');
        }

        const data = await response.json();
        console.log('Fetched orders:', data); // Debug log
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to load orders'
        );
        toast.error(
          error instanceof Error ? error.message : 'Failed to load orders'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPendingOrders();
  }, [session, router]);

  // Debug log when order is selected
  useEffect(() => {
    if (selectedOrder) {
      console.log('Selected order:', selectedOrder);
    }
  }, [selectedOrder]);

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='h-12 w-12 animate-spin text-blue-600 mx-auto mb-4' />
          <p className='text-gray-600'>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <Card className='max-w-2xl mx-auto'>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <AlertCircle className='h-12 w-12 text-red-500 mb-4' />
            <h2 className='text-2xl font-semibold mb-4 text-red-600'>Error</h2>
            <p className='text-gray-600 mb-6 text-center'>{error}</p>
            <Button
              onClick={() => router.push('/')}
              className='gap-2'
            >
              <ArrowLeft className='h-4 w-4' />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <Card className='max-w-2xl mx-auto'>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <ShoppingBag className='h-12 w-12 text-gray-400 mb-4' />
            <h2 className='text-2xl font-semibold mb-4'>No Pending Orders</h2>
            <p className='text-gray-600 mb-6 text-center'>
              You don&apos;t have any orders waiting for payment.
            </p>
            <Button
              onClick={() => router.push('/')}
              className='gap-2'
            >
              <ShoppingBag className='h-4 w-4' />
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex items-center gap-4 mb-8'>
        <Button
          variant='ghost'
          onClick={() => router.push('/')}
          className='gap-2'
        >
          <ArrowLeft className='h-4 w-4' />
          Back
        </Button>
        <h1 className='text-3xl font-bold'>Checkout</h1>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Orders List */}
        <div className='lg:col-span-2 space-y-4'>
          <AnimatePresence>
            {orders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedOrder?._id === order._id
                      ? 'ring-2 ring-blue-500 shadow-lg'
                      : ''
                  }`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <CardHeader>
                    <CardTitle className='flex justify-between items-center'>
                      <span className='text-lg'>Order #{order.orderId}</span>
                      <span className='text-sm font-normal text-gray-500'>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='bg-gray-50 p-3 rounded-lg'>
                          <p className='text-sm text-gray-500'>Total Amount</p>
                          <p className='font-semibold text-lg'>
                            ৳{(order.totalAmount?.bdt || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className='bg-gray-50 p-3 rounded-lg'>
                          <p className='text-sm text-gray-500'>
                            Payment Status
                          </p>
                          <p
                            className={`font-semibold ${
                              order.paymentDetails?.status === 'pending'
                                ? 'text-yellow-600'
                                : 'text-green-600'
                            }`}
                          >
                            {(order.paymentDetails?.status || 'pending')
                              .charAt(0)
                              .toUpperCase() +
                              (order.paymentDetails?.status || 'pending').slice(
                                1
                              )}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className='text-sm text-gray-500 mb-2'>Products</p>
                        <div className='space-y-2'>
                          {order.products.map((item, index) => (
                            <div
                              key={index}
                              className='flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
                            >
                              <div className='relative w-16 h-16'>
                                <Image
                                  fill
                                  src={
                                    item.product?.images?.[0] || '/k2b-logo.png'
                                  }
                                  alt={item.product?.title || 'Product image'}
                                  className='object-cover rounded-md'
                                />
                              </div>
                              <div className='flex-1'>
                                <p className='font-medium'>
                                  {item.product?.title || 'Untitled Product'}
                                </p>
                                <div className='text-sm text-gray-500 space-y-1'>
                                  <p>
                                    Qty: {item.quantity} × ৳
                                    {(
                                      item.unitPrice?.bdt || 0
                                    ).toLocaleString()}
                                  </p>
                                  <p>
                                    Total: ৳
                                    {(
                                      item.totalPrice?.bdt || 0
                                    ).toLocaleString()}
                                  </p>
                                  {item.color.length > 0 && (
                                    <p>Color: {item.color.join(', ')}</p>
                                  )}
                                  {item.size.length > 0 && (
                                    <p>Size: {item.size.join(', ')}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Payment Section */}
        <div className='lg:col-span-1'>
          <AnimatePresence mode='wait'>
            {selectedOrder ? (
              <motion.div
                key='payment'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className='sticky top-8'>
                  <CardHeader>
                    <CardTitle>Complete Payment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-6'>
                      <div className='bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-2'>
                        <div className='flex justify-between items-center'>
                          <p className='text-sm text-blue-600'>Subtotal</p>
                          <p className='font-semibold'>
                            ৳
                            {(
                              selectedOrder.subTotal?.bdt || 0
                            ).toLocaleString()}
                          </p>
                        </div>
                        {selectedOrder.totalDiscount?.bdt > 0 && (
                          <div className='flex justify-between items-center'>
                            <p className='text-sm text-blue-600'>Discount</p>
                            <p className='font-semibold text-green-600'>
                              -৳
                              {(
                                selectedOrder.totalDiscount?.bdt || 0
                              ).toLocaleString()}
                            </p>
                          </div>
                        )}
                        <div className='flex justify-between items-center'>
                          <p className='text-sm text-blue-600'>Shipping</p>
                          <p className='font-semibold'>
                            ৳
                            {(
                              selectedOrder.shippingRate?.bdt || 0
                            ).toLocaleString()}
                          </p>
                        </div>
                        <div className='border-t border-blue-200 pt-2 mt-2'>
                          <div className='flex justify-between items-center'>
                            <p className='text-sm text-blue-600'>
                              Total Amount
                            </p>
                            <p className='text-2xl font-bold text-blue-700'>
                              ৳
                              {(
                                selectedOrder.totalAmount?.bdt || 0
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      {selectedOrder.totalAmount?.bdt ? (
                        <BkashPayment
                          order={selectedOrder}
                          onPaymentSuccess={() => {
                            toast.success('Payment initiated successfully');
                            router.push('/orders');
                          }}
                          onPaymentError={(error) => {
                            toast.error(error);
                          }}
                        />
                      ) : (
                        <div className='text-red-500 text-sm'>
                          Error: Order amount is not available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key='select'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card>
                  <CardContent className='flex flex-col items-center justify-center py-12'>
                    <ShoppingBag className='h-12 w-12 text-gray-400 mb-4' />
                    <p className='text-gray-600 text-center'>
                      Select an order to proceed with payment
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
