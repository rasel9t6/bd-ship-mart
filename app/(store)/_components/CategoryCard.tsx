'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/ui/badge';
import { FolderOpen, ArrowRight } from 'lucide-react';

interface CategoryCardProps {
  category: {
    _id: string;
    name: string;
    title: string;
    description?: string;
    thumbnail: string;
    slug: string;
    icon?: string;
    products?: Array<{ _id: string }>;
    subcategoryDetails?: Array<{ _id: string; name: string }>;
  };
  className?: string;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className='group flex flex-col gap-3 rounded-xl border border-gray-200/80 bg-white/95 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-bondi-blue/20 hover:bg-white'
    >
      {/* Category Image */}
      <div className='relative aspect-square w-full overflow-hidden rounded-lg bg-gray-50'>
        <Image
          src={category.thumbnail || category.icon || '/not-found.gif'}
          alt={category.name}
          fill
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          className='rounded-lg object-cover transition-transform duration-300 group-hover:scale-105'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent' />
      </div>

      {/* Category Info */}
      <div className='flex flex-col gap-2'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-2'>
            <FolderOpen className='h-4 w-4 text-bondi-blue-600' />
            <h3 className='font-semibold text-gray-800 group-hover:text-bondi-blue'>
              {category.name}
            </h3>
          </div>
          <ArrowRight className='h-4 w-4 text-gray-400 group-hover:text-bondi-blue transition-colors' />
        </div>

        {category.description && (
          <p className='text-sm text-gray-600 line-clamp-2'>
            {category.description}
          </p>
        )}

        {/* Subcategories */}
        {category.subcategoryDetails &&
          category.subcategoryDetails.length > 0 && (
            <div className='flex flex-wrap gap-1'>
              {category.subcategoryDetails.slice(0, 3).map((sub) => (
                <Badge
                  key={sub._id}
                  variant='outline'
                  className='text-xs'
                >
                  {sub.name}
                </Badge>
              ))}
              {category.subcategoryDetails.length > 3 && (
                <Badge
                  variant='secondary'
                  className='text-xs'
                >
                  +{category.subcategoryDetails.length - 3} more
                </Badge>
              )}
            </div>
          )}

        {/* Product count */}
        {category.products && (
          <p className='text-xs text-gray-500'>
            {category.products.length} products
          </p>
        )}
      </div>
    </Link>
  );
}
