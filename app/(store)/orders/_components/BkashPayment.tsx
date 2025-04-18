import { useState } from 'react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  const handleBkashPayment = async () => {
    if (!bkashNumber.match(/^01[3-9]\d{8}$/)) {
      toast.error('Please enter a valid bKash number');
      return;
    }

    try {
      setIsLoading(true);

      // Call your backend API to initiate bKash payment
      const response = await fetch('/api/payment/bkash/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: order.totalAmount || order.subTotal,
          orderId: order.orderId,
          currency: order.paymentCurrency || 'BDT',
          bkashNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to initiate bKash payment');
      }

      // Redirect to bKash payment page
      window.location.href = data.paymentUrl;
    } catch (error) {
      console.error('bKash payment error:', error);
      toast.error('Failed to process bKash payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-4'>
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
      <Button
        type='button'
        onClick={handleBkashPayment}
        disabled={isLoading}
        className='w-full'
      >
        {isLoading ? 'Processing...' : 'Pay with bKash'}
      </Button>
      <p className='text-sm text-gray-500 text-center'>
        You will be redirected to bKash payment page
      </p>
    </div>
  );
};
