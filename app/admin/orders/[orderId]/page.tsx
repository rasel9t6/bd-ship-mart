'use client';

import { use } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/ui/button';
import { Separator } from '@radix-ui/react-dropdown-menu';
import {
  OrderHeader,
  OrderSummary,
  CustomerInfo,
  OrderItems,
  TrackingHistory,
  PaymentTransactions,
  OrderNotes,
  Loading,
  useOrder,
} from './_components';

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const { order, loading, updating, updateOrderStatus, router } =
    useOrder(orderId);

  if (loading) {
    return <Loading />;
  }

  if (!order) {
    return (
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <p>Order not found</p>
        <Button onClick={() => router.push('/orders')}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <OrderHeader
          order={order}
          onBack={() => router.push('/orders')}
        />

        <Separator />

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <OrderSummary
            order={order}
            updating={updating}
            onStatusUpdate={updateOrderStatus}
          />
          <CustomerInfo order={order} />
        </div>

        <OrderItems order={order} />
        <TrackingHistory order={order} />
        <PaymentTransactions order={order} />
        <OrderNotes order={order} />
      </div>
    </div>
  );
}
