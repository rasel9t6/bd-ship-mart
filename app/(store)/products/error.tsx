'use client';

import { useEffect } from 'react';
import { Button } from '@/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Products page error:', error);
  }, [error]);

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
      <div className='max-w-md mx-auto text-center'>
        <div className='mb-6'>
          <div className='mx-auto h-12 w-12 text-red-500 mb-4'>
            <svg
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>
            Something went wrong!
          </h2>
          <p className='text-gray-600 mb-6'>
            We encountered an error while loading the products. Please try
            again.
          </p>
        </div>

        <div className='space-y-3'>
          <Button
            onClick={reset}
            className='w-full'
          >
            Try Again
          </Button>
          <Button
            variant='outline'
            onClick={() => (window.location.href = '/')}
            className='w-full'
          >
            Go Home
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className='mt-6 text-left'>
            <summary className='cursor-pointer text-sm text-gray-500 hover:text-gray-700'>
              Error Details (Development)
            </summary>
            <pre className='mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto'>
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
