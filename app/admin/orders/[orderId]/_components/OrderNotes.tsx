import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/card';
import { Order } from './types';

interface OrderNotesProps {
  order: Order;
}

const OrderNotes: React.FC<OrderNotesProps> = ({ order }) => {
  if (order.notes.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {order.notes.map((note, index) => (
            <div
              key={index}
              className='bg-muted p-4 rounded-md'
            >
              <div className='flex justify-between items-start'>
                <div>
                  <p className='font-medium'>{note.createdBy}</p>
                  <p className='text-sm text-muted-foreground'>
                    {format(new Date(note.createdAt), 'MMM d, yyyy - h:mm a')}
                  </p>
                </div>
                {note.isInternal && <Badge variant='outline'>Internal</Badge>}
              </div>
              <p className='mt-2'>{note.text}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderNotes;
