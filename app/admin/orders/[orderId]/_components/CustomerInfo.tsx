import React from 'react';
import { Badge } from '@/ui/badge';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/card';
import { Order } from './types';
import { formatAddress } from './utils';

interface CustomerInfoProps {
  order: Order;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ order }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div>
            <h3 className='font-medium'>{order.customerInfo?.name || 'N/A'}</h3>
            <p className='text-sm text-muted-foreground'>
              {order.customerInfo?.email || 'N/A'}
            </p>
            <p className='text-sm text-muted-foreground'>
              {order.customerInfo?.phone || 'N/A'}
            </p>
            <Badge className='mt-1'>
              {order.customerInfo?.customerType || 'regular'}
            </Badge>

            {/* Show warning if customer info is incomplete */}
            {(!order.customerInfo?.name ||
              !order.customerInfo?.email ||
              !order.customerInfo?.phone) && (
              <div className='mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md'>
                <p className='text-xs text-yellow-800'>
                  ⚠️ Customer profile information is incomplete. This may affect
                  order processing and delivery.
                </p>
              </div>
            )}
          </div>
          <Separator />
          {order.shippingAddress ? (
            <div>
              <h3 className='font-medium'>Shipping Address</h3>
              <p className='text-sm text-muted-foreground'>
                {formatAddress(order.shippingAddress)}
              </p>
            </div>
          ) : (
            <div className='p-2 bg-red-50 border border-red-200 rounded-md'>
              <h3 className='font-medium text-red-800'>Shipping Address</h3>
              <p className='text-xs text-red-700'>
                ❌ No shipping address provided. This order cannot be processed.
              </p>
            </div>
          )}
          <Separator />
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerInfo;
