import React from 'react';
import { format } from 'date-fns';
import { ArrowLeft, Printer, Send } from 'lucide-react';
import { Button } from '@/ui/button';
import Heading from '@/ui/custom/Heading';
import { Order } from './types';

interface OrderHeaderProps {
  order: Order;
  onBack: () => void;
}

const OrderHeader: React.FC<OrderHeaderProps> = ({ order, onBack }) => {
  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='icon'
          onClick={onBack}
        >
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <Heading
          title={`Order ${order.orderId}`}
          description={`Placed on ${format(new Date(order.createdAt), 'MMMM d, yyyy')}`}
        />
      </div>
      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
        >
          <Printer className='mr-2 h-4 w-4' />
          Print
        </Button>
        <Button
          variant='outline'
          size='sm'
        >
          <Send className='mr-2 h-4 w-4' />
          Send Invoice
        </Button>
      </div>
    </div>
  );
};

export default OrderHeader;
