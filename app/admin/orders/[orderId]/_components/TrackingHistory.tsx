import React from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/card';
import { Order } from './types';

interface TrackingHistoryProps {
  order: Order;
}

const TrackingHistory: React.FC<TrackingHistoryProps> = ({ order }) => {
  // Find the current status in tracking history
  const currentStatus = order.status;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tracking History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {order.trackingHistory.length > 0 ? (
            <div className='relative'>
              <div className='absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200'></div>
              {order.trackingHistory.map((event, index) => {
                // Check if this is the current status
                const isCurrentStatus =
                  event.status
                    .toLowerCase()
                    .includes(currentStatus.toLowerCase()) ||
                  (currentStatus === 'pending' &&
                    event.status === 'Order Placed') ||
                  (currentStatus === 'confirmed' &&
                    event.status === 'Order Confirmed') ||
                  (currentStatus === 'processing' &&
                    event.status === 'Processing') ||
                  (currentStatus === 'shipped' && event.status === 'Shipped') ||
                  (currentStatus === 'delivered' &&
                    event.status === 'Delivered') ||
                  (currentStatus === 'canceled' &&
                    event.status === 'Order Canceled');

                return (
                  <div
                    key={index}
                    className='relative pl-10 pb-8'
                  >
                    <div
                      className={`absolute left-3 -translate-x-1/2 h-6 w-6 rounded-full flex items-center justify-center ${
                        isCurrentStatus
                          ? 'bg-green-500 ring-4 ring-green-200'
                          : 'bg-primary'
                      }`}
                    >
                      <div className='h-2 w-2 rounded-full bg-white'></div>
                    </div>
                    <div className='flex flex-col'>
                      <p
                        className={`font-medium ${
                          isCurrentStatus ? 'text-green-600' : ''
                        }`}
                      >
                        {event.status.charAt(0).toUpperCase() +
                          event.status.slice(1)}
                        {isCurrentStatus && (
                          <span className='ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full'>
                            Current
                          </span>
                        )}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {format(
                          new Date(event.timestamp),
                          'MMM d, yyyy - h:mm a'
                        )}
                      </p>
                      <p className='text-sm'>{event.location}</p>
                      {event.notes && (
                        <p className='text-sm italic text-gray-600'>
                          {event.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No tracking information available yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrackingHistory;
