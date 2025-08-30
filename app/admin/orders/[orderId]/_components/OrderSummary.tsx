import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/card';
import { Order } from './types';
import { getStatusColor } from './utils';

interface OrderSummaryProps {
  order: Order;
  updating: boolean;
  onStatusUpdate: (status: string) => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  order,
  updating,
  onStatusUpdate,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <span className='text-muted-foreground'>Status</span>
            <Badge variant={getStatusColor(order.status)}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-muted-foreground'>Payment Status</span>
            <Badge
              variant={
                order.paymentDetails.status === 'paid' ? 'success' : 'warning'
              }
            >
              {order.paymentDetails.status.charAt(0).toUpperCase() +
                order.paymentDetails.status.slice(1).replace('_', ' ')}
            </Badge>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-muted-foreground'>Payment Method</span>
            <span>{order.paymentMethod}</span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-muted-foreground'>Payment Currency</span>
            <span>{order.paymentCurrency}</span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-muted-foreground'>Shipping Method</span>
            <span>{order.shippingMethod}</span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-muted-foreground'>Delivery Type</span>
            <span>{order.deliveryType}</span>
          </div>
          {order.estimatedDeliveryDate && (
            <div className='flex justify-between items-center'>
              <span className='text-muted-foreground'>Est. Delivery Date</span>
              <span>
                {format(new Date(order.estimatedDeliveryDate), 'MMM d, yyyy')}
              </span>
            </div>
          )}
          <Separator />
          <div className='space-y-2'>
            <h3 className='font-medium'>Update Status</h3>
            <div className='flex flex-wrap gap-2'>
              {[
                'pending',
                'confirmed',
                'processing',
                'shipped',
                'delivered',
                'canceled',
              ].map((status) => (
                <Button
                  key={status}
                  size='sm'
                  variant={order.status === status ? 'default' : 'outline'}
                  onClick={() => onStatusUpdate(status)}
                  disabled={updating}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
