'use client';

import { useState, useRef, useEffect } from 'react';

import { X, ChevronDown } from 'lucide-react';
import { Command, CommandGroup, CommandInput, CommandItem } from '../command';
import { Badge } from '../badge';

interface Subcategory {
  _id: string;
  name: string;
}

interface MultiSelectProps {
  placeholder: string;
  categories: Subcategory[];
  value: string[];
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
}

export default function MultiSelect({
  placeholder,
  categories,
  value,
  onChange,
  onRemove,
}: MultiSelectProps) {
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);
  const commandRef = useRef<HTMLDivElement>(null);

  const selected =
    value.length === 0
      ? []
      : value
          .map((id) => categories.find((category) => category._id === id))
          .filter(
            (category): category is Subcategory => category !== undefined
          );

  const selectable = categories.filter(
    (category) =>
      !selected.some(
        (selectedCategory) => selectedCategory._id === category._id
      )
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        commandRef.current &&
        !commandRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className='relative'
      ref={commandRef}
    >
      <Command className='overflow-visible bg-white'>
        <div className='flex flex-wrap gap-1.5 rounded-md border border-gray-1/25 p-2'>
          {selected.map((category: Subcategory) => (
            <Badge
              key={category._id}
              variant='secondary'
              className='px-2 py-1'
            >
              {category.name}
              <button
                type='button'
                className='ml-1 rounded-full transition-colors duration-200 hover:bg-red-1'
                onClick={() => onRemove(category._id)}
              >
                <X className='size-3 text-red-1 transition-colors duration-300 hover:text-white' />
              </button>
            </Badge>
          ))}

          <div className='flex flex-1 items-center'>
            <CommandInput
              placeholder={selected.length === 0 ? placeholder : ''}
              value={inputValue}
              onValueChange={setInputValue}
              onBlur={() => setTimeout(() => setOpen(false), 200)}
              onFocus={() => setOpen(true)}
              className='flex-1 border-none focus:ring-0'
            />
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          </div>
        </div>

        {open && (
          <CommandGroup className='absolute top-full z-30 mt-1 w-full overflow-auto rounded-md border border-gray-1/25 bg-white shadow-md max-h-60'>
            {selectable.length === 0 ? (
              <div className='p-2 text-sm text-gray-500'>
                No options available
              </div>
            ) : (
              selectable.map((category: Subcategory) => (
                <CommandItem
                  key={category._id}
                  onMouseDown={(e) => e.preventDefault()}
                  onSelect={() => {
                    onChange(category._id);
                    setInputValue('');
                  }}
                  className='cursor-pointer px-4 py-2 hover:bg-gray-2'
                >
                  {category.name}
                </CommandItem>
              ))
            )}
          </CommandGroup>
        )}
      </Command>
    </div>
  );
}
