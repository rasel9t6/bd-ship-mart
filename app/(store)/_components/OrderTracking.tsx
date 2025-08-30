import React from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/card';
import { Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';

interface TrackingEvent {
  status: string;
  timestamp: Date;
  location: string;
  notes: string;
}

interface OrderTrackingProps {
  trackingHistory: TrackingEvent[];
  currentStatus: string;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({
  trackingHistory,
  currentStatus,
}) => {
  const getStatusIcon = (status: string) => {
    if (status.toLowerCase().includes('delivered'))
      return <CheckCircle className='h-5 w-5 text-green-500' />;
    if (
      status.toLowerCase().includes('shipped') ||
      status.toLowerCase().includes('transit')
    )
      return <Truck className='h-5 w-5 text-blue-500' />;
    if (status.toLowerCase().includes('canceled'))
      return <XCircle className='h-5 w-5 text-red-500' />;
    return <Clock className='h-5 w-5 text-orange-500' />;
  };

  const getStatusColor = (status: string) => {
    if (status.toLowerCase().includes('delivered')) return 'text-green-600';
    if (
      status.toLowerCase().includes('shipped') ||
      status.toLowerCase().includes('transit')
    )
      return 'text-blue-600';
    if (status.toLowerCase().includes('canceled')) return 'text-red-600';
    return 'text-orange-600';
  };

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Package className='h-5 w-5' />
          Order Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {trackingHistory && trackingHistory.length > 0 ? (
            <div className='relative'>
              <div className='absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200'></div>
              {trackingHistory.map((event, index) => {
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
                    className='relative pl-10 pb-6'
                  >
                    <div
                      className={`absolute left-3 -translate-x-1/2 h-6 w-6 rounded-full flex items-center justify-center ${
                        isCurrentStatus
                          ? 'bg-green-500 ring-4 ring-green-200'
                          : 'bg-gray-300'
                      }`}
                    >
                      {getStatusIcon(event.status)}
                    </div>
                    <div className='flex flex-col'>
                      <p
                        className={`font-medium ${getStatusColor(event.status)} ${
                          isCurrentStatus ? 'text-green-600' : ''
                        }`}
                      >
                        {event.status}
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
                      <p className='text-sm text-gray-600'>{event.location}</p>
                      {event.notes && (
                        <p className='text-sm italic text-gray-600 mt-1'>
                          {event.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='text-center py-8'>
              <Package className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-500'>
                No tracking information available yet.
              </p>
              <p className='text-sm text-gray-400'>
                Your order is being processed.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderTracking;
