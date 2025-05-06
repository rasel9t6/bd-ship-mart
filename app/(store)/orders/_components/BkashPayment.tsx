import { useState } from 'react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { toast } from 'react-hot-toast';
import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/ui/alert';

type Currency = 'bdt' | 'usd' | 'cny';

interface OrderData {
  _id?: string;
  orderId?: string;
  totalAmount?: {
    bdt: number;
    usd: number;
    cny: number;
  };
  subTotal?: {
    bdt: number;
    usd: number;
    cny: number;
  };
  paymentMethod?: string;
  paymentCurrency?: string;
}

interface BkashPaymentProps {
  order: OrderData;
}

export const BkashPayment = ({ order }: BkashPaymentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [bkashNumber, setBkashNumber] = useState('');

  const handleBkashPayment = async () => {
    if (!bkashNumber.match(/^01[3-9]\d{8}$/)) {
      toast.error('Please enter a valid bKash number');
      return;
    }

    // Validate order data
    if (!order.orderId) {
      toast.error('Invalid order ID');
      return;
    }

    const amount = order.totalAmount || order.subTotal;
    if (!amount) {
      toast.error('Invalid order amount');
      return;
    }

    const currency = (order.paymentCurrency || 'BDT').toLowerCase() as Currency;
    if (!amount[currency]) {
      toast.error(`No amount found for currency ${currency.toUpperCase()}`);
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        amount,
        orderId: order.orderId,
        currency: currency.toUpperCase(),
        bkashNumber,
      };

      // Call your backend API to initiate bKash payment
      const response = await fetch('/api/payment/bkash/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to initiate bKash payment');
      }

      // Store the payment URL in sessionStorage for the callback
      sessionStorage.setItem('bkashPaymentUrl', data.paymentUrl);
      sessionStorage.setItem('orderId', order.orderId);

      // Redirect to bKash payment page
      window.location.href = data.paymentUrl;
    } catch (error) {
      console.error('bKash payment error:', error);
      toast.error('Failed to process bKash payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const amount = order.totalAmount || order.subTotal;
  const bKashFee = amount?.bdt ? amount.bdt * 0.015 : 0; // 1.5% bKash fee
  const totalWithFee = amount?.bdt ? amount.bdt + bKashFee : 0;

  return (
    <div className='space-y-4'>
      <Alert>
        <Info className='h-4 w-4' />
        <AlertDescription>
          By proceeding with bKash payment, you agree to save your bKash account
          for future transactions with us. Your account details will be securely
          stored by bKash.
        </AlertDescription>
      </Alert>

      <div className='space-y-2'>
        <Label htmlFor='bkashNumber'>bKash Number</Label>
        <Input
          id='bkashNumber'
          type='tel'
          placeholder='01XXXXXXXXX'
          value={bkashNumber}
          onChange={(e) => setBkashNumber(e.target.value)}
          maxLength={11}
          pattern='^01[3-9]\d{8}$'
          required
        />
        <p className='text-xs text-gray-500'>
          Enter the bKash number you want to pay from
        </p>
      </div>

      <div className='bg-gray-50 p-4 rounded-lg space-y-2'>
        <div className='flex justify-between items-center'>
          <span className='text-sm text-gray-600'>Order Amount</span>
          <span className='font-medium'>৳{amount?.bdt?.toLocaleString()}</span>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-sm text-gray-600'>bKash Fee (1.5%)</span>
          <span className='font-medium'>৳{bKashFee.toLocaleString()}</span>
        </div>
        <div className='border-t pt-2 mt-2'>
          <div className='flex justify-between items-center'>
            <span className='text-sm font-medium'>Total Amount</span>
            <span className='font-bold text-lg'>
              ৳{totalWithFee.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <Button
        type='button'
        onClick={handleBkashPayment}
        disabled={isLoading}
        className='w-full'
      >
        {isLoading ? 'Processing...' : 'Pay with bKash'}
      </Button>

      <div className='text-xs text-gray-500 space-y-2'>
        <p className='text-center'>
          You will be redirected to bKash payment page
        </p>
        <p className='text-center'>
          For any issues, please contact bKash Customer Care at 16247
        </p>
      </div>
    </div>
  );
};
