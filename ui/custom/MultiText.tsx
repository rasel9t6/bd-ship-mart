'use client';
import { useState, KeyboardEvent, useRef } from 'react';

import { Input } from '../input';
import { Badge } from '../badge';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiTextProps {
  placeholder: string;
  value: string[];
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  className?: string;
}

export default function MultiText({
  placeholder,
  value,
  onChange,
  onRemove,
  className,
}: MultiTextProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addValue = (item: string) => {
    // Trim the input and convert to lowercase/uppercase as needed
    const processedItem = item.trim().toUpperCase();

    // Prevent adding empty or duplicate values
    if (processedItem && !value.includes(processedItem)) {
      onChange(processedItem);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addValue(inputValue);
    }

    // Allow adding with comma
    if (e.key === ',') {
      e.preventDefault();
      addValue(inputValue.replace(',', ''));
    }

    // Allow removing last item with backspace when input is empty
    if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      e.preventDefault();
      onRemove(value[value.length - 1]);
    }
  };

  // Focus input when clicking on the container
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        'min-h-[42px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        'transition-colors duration-200',
        isFocused && 'border-ring',
        className
      )}
      onClick={handleContainerClick}
    >
      <div className='flex flex-wrap gap-2'>
        {value.map((item, index) => (
          <Badge
            key={`${item}-${index}`}
            variant='primary'
            className='group flex items-center gap-1 bg-primary/80 hover:bg-primary'
          >
            {item}
            <button
              className='ml-1 rounded-full p-0.5 hover:bg-destructive hover:text-destructive-foreground'
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item);
              }}
              type='button'
              aria-label={`Remove ${item}`}
            >
              <X className='size-3' />
            </button>
          </Badge>
        ))}
        <Input
          ref={inputRef}
          placeholder={value.length === 0 ? placeholder : 'Add more...'}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className='h-6 min-w-[100px] flex-1 border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0'
        />
      </div>
    </div>
  );
}
