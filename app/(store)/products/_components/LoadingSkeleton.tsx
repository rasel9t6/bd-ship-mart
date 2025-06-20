'use client';

import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

export default function LoadingSkeleton({
  count = 8,
  className,
}: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className='bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse'
        >
          {/* Image Skeleton */}
          <div className='aspect-[4/3] bg-gray-200 relative'>
            <div className='absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer' />
          </div>

          {/* Content Skeleton */}
          <div className='p-4 space-y-3'>
            {/* Title */}
            <div className='h-4 bg-gray-200 rounded w-3/4'>
              <div className='h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer' />
            </div>

            {/* Description */}
            <div className='space-y-2'>
              <div className='h-3 bg-gray-200 rounded w-full'>
                <div className='h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer' />
              </div>
              <div className='h-3 bg-gray-200 rounded w-2/3'>
                <div className='h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer' />
              </div>
            </div>

            {/* Price */}
            <div className='h-5 bg-gray-200 rounded w-1/3'>
              <div className='h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer' />
            </div>

            {/* Button */}
            <div className='h-8 bg-gray-200 rounded'>
              <div className='h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
