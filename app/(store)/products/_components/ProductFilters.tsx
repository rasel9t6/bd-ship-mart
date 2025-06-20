'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/ui/button';
import { CategoryType } from '@/types/next-utils';

interface ProductFiltersProps {
  categories: CategoryType[];
  currentCategory: string;
  currentSubcategory: string;
  currentMinPrice?: number;
  currentMaxPrice?: number;
}

export default function ProductFilters({
  categories,
  currentCategory,
  currentSubcategory,
  currentMinPrice,
  currentMaxPrice,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'category',
    'price',
  ]);
  const [priceRange, setPriceRange] = useState({
    min: currentMinPrice?.toString() || '',
    max: currentMaxPrice?.toString() || '',
  });

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Reset to page 1 when filters change
    params.delete('page');

    router.push(`/products?${params.toString()}`);
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({
      minPrice: priceRange.min || null,
      maxPrice: priceRange.max || null,
    });
  };

  const clearFilters = () => {
    setPriceRange({ min: '', max: '' });
    router.push('/products');
  };

  const hasActiveFilters =
    currentCategory || currentSubcategory || currentMinPrice || currentMaxPrice;

  return (
    <div className='bg-white rounded-lg border border-gray-200 p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Filter className='h-5 w-5 text-gray-600' />
          <h3 className='text-lg font-semibold text-gray-900'>Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant='ghost'
            size='sm'
            onClick={clearFilters}
            className='text-gray-500 hover:text-gray-700'
          >
            <X className='h-4 w-4 mr-1' />
            Clear
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <div className='border-b border-gray-200 pb-4'>
        <button
          onClick={() => toggleSection('category')}
          className='flex items-center justify-between w-full text-left'
        >
          <span className='font-medium text-gray-900'>Category</span>
          {expandedSections.includes('category') ? (
            <ChevronUp className='h-4 w-4' />
          ) : (
            <ChevronDown className='h-4 w-4' />
          )}
        </button>

        {expandedSections.includes('category') && (
          <div className='mt-3 space-y-2'>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='radio'
                name='category'
                value=''
                checked={!currentCategory}
                onChange={() =>
                  updateFilters({ category: null, subcategory: null })
                }
                className='text-blue-600 focus:ring-blue-500'
              />
              <span className='text-sm text-gray-700'>All Categories</span>
            </label>

            {categories.map((category) => (
              <label
                key={category._id}
                className='flex items-center gap-2 cursor-pointer'
              >
                <input
                  type='radio'
                  name='category'
                  value={category.slug}
                  checked={currentCategory === category.slug}
                  onChange={() =>
                    updateFilters({
                      category: category.slug,
                      subcategory: null,
                    })
                  }
                  className='text-blue-600 focus:ring-blue-500'
                />
                <span className='text-sm text-gray-700'>{category.title}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <div className='border-b border-gray-200 pb-4'>
        <button
          onClick={() => toggleSection('price')}
          className='flex items-center justify-between w-full text-left'
        >
          <span className='font-medium text-gray-900'>Price Range</span>
          {expandedSections.includes('price') ? (
            <ChevronUp className='h-4 w-4' />
          ) : (
            <ChevronDown className='h-4 w-4' />
          )}
        </button>

        {expandedSections.includes('price') && (
          <form
            onSubmit={handlePriceSubmit}
            className='mt-3 space-y-3'
          >
            <div className='grid grid-cols-2 gap-2'>
              <input
                type='number'
                placeholder='Min'
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange((prev) => ({ ...prev, min: e.target.value }))
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500'
              />
              <input
                type='number'
                placeholder='Max'
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange((prev) => ({ ...prev, max: e.target.value }))
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
            <Button
              type='submit'
              size='sm'
              className='w-full'
            >
              Apply Price Range
            </Button>
          </form>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className='pt-4 border-t border-gray-200'>
          <div className='text-sm font-medium text-gray-700 mb-2'>
            Active Filters:
          </div>
          <div className='flex flex-wrap gap-2'>
            {currentCategory && (
              <span className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'>
                Category:{' '}
                {categories.find((c) => c.slug === currentCategory)?.title}
                <button
                  onClick={() =>
                    updateFilters({ category: null, subcategory: null })
                  }
                  className='ml-1 hover:text-blue-600'
                >
                  <X className='h-3 w-3' />
                </button>
              </span>
            )}
            {currentMinPrice && (
              <span className='inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
                Min: ৳{currentMinPrice}
                <button
                  onClick={() => updateFilters({ minPrice: null })}
                  className='ml-1 hover:text-green-600'
                >
                  <X className='h-3 w-3' />
                </button>
              </span>
            )}
            {currentMaxPrice && (
              <span className='inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
                Max: ৳{currentMaxPrice}
                <button
                  onClick={() => updateFilters({ maxPrice: null })}
                  className='ml-1 hover:text-green-600'
                >
                  <X className='h-3 w-3' />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
