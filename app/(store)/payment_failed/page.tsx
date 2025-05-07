import Link from 'next/link';

import { AlertCircle } from 'lucide-react';
import { Card } from '@/ui/card';
import { Button } from '@/ui/button';

export default function PaymentFailedPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <Card className='max-w-md w-full space-y-8 p-8'>
        <div className='text-center'>
          <div className='flex justify-center'>
            <AlertCircle className='h-16 w-16 text-red-500' />
          </div>
          <h2 className='mt-6 text-3xl font-bold text-gray-900'>
            Payment Failed
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            We couldn&apos;t process your payment. This could be due to:
          </p>
          <ul className='mt-2 text-sm text-gray-600 list-disc list-inside'>
            <li>Insufficient balance in your bKash account</li>
            <li>Network connectivity issues</li>
            <li>Transaction timeout</li>
            <li>Other technical issues</li>
          </ul>
        </div>

        <div className='mt-8 space-y-4'>
          <Button
            asChild
            className='w-full bg-primary hover:bg-primary/90'
          >
            <Link href='/cart'>Try Again</Link>
          </Button>

          <div className='text-center'>
            <p className='text-sm text-gray-600'>
              Need help? Contact our support team
            </p>
            <Link
              href='/contact'
              className='text-sm font-medium text-primary hover:text-primary/90'
            >
              Contact Support
            </Link>
          </div>
        </div>
        <div className='mt-6 text-center text-sm text-gray-500'>
          <p>
            If you&apos;ve been charged but didn&apos;t receive a confirmation,
            please{' '}
            <Link
              href='/contact'
              className='font-medium text-primary hover:text-primary/90'
            >
              contact us {''}
            </Link>
            with your order details.
          </p>
        </div>
      </Card>
    </div>
  );
}
