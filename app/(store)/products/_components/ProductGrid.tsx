'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductType } from '@/types/next-utils';
import ProductCard from './ProductCard';
import { Button } from '@/ui/button';

interface ProductGridProps {
  products: ProductType[];
  currentPage: number;
}

export default function ProductGrid({
  products,
  currentPage,
}: ProductGridProps) {
  const router = useRouter();
  const searchParamsObj = useSearchParams();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Load more products
  const loadMore = async () => {
    if (!searchParamsObj || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const params = new URLSearchParams(searchParamsObj);
      const nextPage = currentPage + 1;
      params.set('page', nextPage.toString());
      router.push(`/products?${params.toString()}`);
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (products.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='mx-auto h-12 w-12 text-gray-400'>
          <svg
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
            />
          </svg>
        </div>
        <h3 className='mt-2 text-sm font-medium text-gray-900'>
          No products found
        </h3>
        <p className='mt-1 text-sm text-gray-500'>
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Products Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
          />
        ))}
      </div>

      {/* Load More Button */}
      <div className='flex justify-center py-8'>
        <Button
          onClick={loadMore}
          disabled={isLoadingMore}
          variant='outline'
          size='lg'
          className='px-8'
        >
          {isLoadingMore ? (
            <>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2'></div>
              Loading...
            </>
          ) : (
            'Load More Products'
          )}
        </Button>
      </div>
    </div>
  );
}
