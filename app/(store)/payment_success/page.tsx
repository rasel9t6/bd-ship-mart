'use client';

import useCart from '@/hooks/useCart';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card } from '@/ui/card';
import { Button } from '@/ui/button';
import { CheckCircle2, Download, ShoppingBag } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';

interface OrderDetails {
  orderId: string;
  createdAt: string;
  totalAmount: {
    bdt: number;
    usd: number;
    cny: number;
  };
  paymentCurrency: string;
  paymentMethod: string;
  products: Array<{
    name: string;
    quantity: number;
    totalPrice: {
      bdt: number;
      usd: number;
      cny: number;
    };
  }>;
}

const SuccessfulPayment = () => {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Clear cart only once when component mounts
    clearCart();

    // Fetch order details if orderId is present
    const orderId = searchParams.get('orderId');
    if (orderId) {
      fetchOrderDetails(orderId);
    } else {
      setIsLoading(false);
    }
  }, [clearCart, searchParams]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) throw new Error('Failed to fetch order details');
      const data = await response.json();
      setOrderDetails(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!orderDetails) return;

    try {
      const response = await fetch(
        `/api/orders/${orderDetails.orderId}/invoice`
      );
      if (!response.ok) throw new Error('Failed to generate invoice');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderDetails.orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 pt-20 sm:pt-26 lg:pt-[120px] py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-3xl mx-auto'>
        <Card className='p-6'>
          <div className='text-center mb-8'>
            <div className='flex justify-center mb-4'>
              <CheckCircle2 className='h-16 w-16 text-green-500' />
            </div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Payment Successful!
            </h1>
            <p className='text-gray-600'>Thank you for your purchase</p>
          </div>

          {orderDetails && (
            <div className='space-y-6'>
              <div className='bg-gray-50 p-4 rounded-lg'>
                <h2 className='text-lg font-semibold mb-4'>Order Details</h2>
                <div className='space-y-2'>
                  <p>
                    <span className='font-medium'>Order ID:</span>{' '}
                    {orderDetails.orderId}
                  </p>
                  <p>
                    <span className='font-medium'>Date:</span>{' '}
                    {format(new Date(orderDetails.createdAt), 'PPP')}
                  </p>
                  <p>
                    <span className='font-medium'>Payment Method:</span>{' '}
                    {orderDetails.paymentMethod}
                  </p>
                  <p>
                    <span className='font-medium'>Total Amount:</span>{' '}
                    {
                      orderDetails.totalAmount[
                        orderDetails.paymentCurrency.toLowerCase() as keyof typeof orderDetails.totalAmount
                      ]
                    }{' '}
                    {orderDetails.paymentCurrency}
                  </p>
                </div>
              </div>

              <div className='bg-gray-50 p-4 rounded-lg'>
                <h2 className='text-lg font-semibold mb-4'>Order Items</h2>
                <div className='space-y-2'>
                  {orderDetails.products.map((product, index) => (
                    <div
                      key={index}
                      className='flex justify-between items-center'
                    >
                      <span>
                        {product.name} x {product.quantity}
                      </span>
                      <span>
                        {
                          product.totalPrice[
                            orderDetails.paymentCurrency.toLowerCase() as keyof typeof product.totalPrice
                          ]
                        }{' '}
                        {orderDetails.paymentCurrency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className='flex justify-center gap-4'>
                <Button
                  onClick={handleDownloadInvoice}
                  className='flex items-center gap-2'
                >
                  <Download className='h-4 w-4' />
                  Download Invoice
                </Button>
                <Button
                  asChild
                  variant='outline'
                  className='flex items-center gap-2'
                >
                  <Link href='/orders'>
                    <ShoppingBag className='h-4 w-4' />
                    View Orders
                  </Link>
                </Button>
              </div>
            </div>
          )}

          <div className='mt-8 text-center'>
            <Button
              asChild
              variant='link'
            >
              <Link href='/'>Continue Shopping</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SuccessfulPayment;
