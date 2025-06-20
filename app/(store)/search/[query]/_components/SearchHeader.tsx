'use client';

import { Filter } from 'lucide-react';
import { Button } from '@/ui/button';

interface SearchHeaderProps {
  query: string;
  totalResults: number;
  searchTime: number;
  onToggleFilters: () => void;
  showFilters: boolean;
}

export default function SearchHeader({
  query,
  totalResults,
  searchTime,
  onToggleFilters,
  showFilters,
}: SearchHeaderProps) {
  return (
    <div className='bg-white border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <div className='flex-1'>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>
              Search Results for &ldquo;{query}&rdquo;
            </h1>
            <p className='text-gray-600'>
              {totalResults.toLocaleString()} results found in {searchTime}ms
            </p>
          </div>

          <Button
            onClick={onToggleFilters}
            variant='outline'
            size='sm'
            className='flex items-center gap-2'
          >
            <Filter className='h-4 w-4' />
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
