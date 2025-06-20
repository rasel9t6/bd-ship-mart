'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CategoryType } from '@/types/next-utils';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: CategoryType;
  className?: string;
}

export default function CategoryCard({
  category,
  className,
}: CategoryCardProps) {
  const { name, title, description, thumbnail, slug, products } = category;
  const productCount = products?.length || 0;

  return (
    <Link
      href={`/categories/${slug}`}
      className={cn(
        'group block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1',
        className
      )}
    >
      {/* Image Container */}
      <div className='relative aspect-[4/3] overflow-hidden bg-gray-100'>
        <Image
          src={thumbnail}
          alt={title}
          fill
          className='object-cover group-hover:scale-105 transition-transform duration-300'
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw'
        />
        <div className='absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300' />

        {/* Product Count Badge */}
        {productCount > 0 && (
          <div className='absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700'>
            {productCount} {productCount === 1 ? 'product' : 'products'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className='p-4'>
        <h3 className='text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1'>
          {title}
        </h3>

        {description && (
          <p className='mt-2 text-sm text-gray-600 line-clamp-2'>
            {description}
          </p>
        )}

        {/* Category Name */}
        <p className='mt-3 text-xs font-medium text-gray-500 uppercase tracking-wide'>
          {name}
        </p>

        {/* View Category Button */}
        <div className='mt-4 flex items-center justify-between'>
          <span className='text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors duration-200'>
            View Category
          </span>
          <svg
            className='w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 5l7 7-7 7'
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
