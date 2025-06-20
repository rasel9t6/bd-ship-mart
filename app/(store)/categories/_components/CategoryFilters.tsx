'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';

interface CategoryFiltersProps {
  currentSearch: string;
  currentFeatured: boolean;
}

export default function CategoryFilters({
  currentSearch,
  currentFeatured,
}: CategoryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(currentSearch);

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

    router.push(`/categories?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchValue || null });
  };

  const clearFilters = () => {
    setSearchValue('');
    router.push('/categories');
  };

  const hasActiveFilters = currentSearch || currentFeatured;

  return (
    <div className='space-y-4'>
      {/* Search */}
      <form
        onSubmit={handleSearch}
        className='relative'
      >
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
        <Input
          type='text'
          placeholder='Search categories...'
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className='pl-10 pr-10'
        />
        {searchValue && (
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0'
            onClick={() => setSearchValue('')}
          >
            <X className='h-4 w-4' />
          </Button>
        )}
      </form>

      {/* Filters */}
      <div className='space-y-3'>
        <div className='flex items-center gap-2 text-sm font-medium text-gray-700'>
          <Filter className='h-4 w-4' />
          Filters
        </div>

        {/* Featured Filter */}
        <div className='space-y-2'>
          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='checkbox'
              checked={currentFeatured}
              onChange={(e) =>
                updateFilters({ featured: e.target.checked ? 'true' : null })
              }
              className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
            />
            <span className='text-sm text-gray-700'>Featured Categories</span>
          </label>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant='outline'
            size='sm'
            onClick={clearFilters}
            className='w-full'
          >
            <X className='h-4 w-4 mr-2' />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className='pt-4 border-t border-gray-200'>
          <div className='text-sm font-medium text-gray-700 mb-2'>
            Active Filters:
          </div>
          <div className='flex flex-wrap gap-2'>
            {currentSearch && (
              <span className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'>
                Search: &ldquo;{currentSearch}&rdquo;
                <button
                  onClick={() => updateFilters({ search: null })}
                  className='ml-1 hover:text-blue-600'
                >
                  <X className='h-3 w-3' />
                </button>
              </span>
            )}
            {currentFeatured && (
              <span className='inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
                Featured
                <button
                  onClick={() => updateFilters({ featured: null })}
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
