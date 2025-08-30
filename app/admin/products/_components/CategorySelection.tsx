import React, { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ChevronsUpDown } from 'lucide-react';
import { Button } from '@/ui/button';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/ui/command';
import { FormValues, Category, Subcategory } from './types';

interface CategorySelectionProps {
  form: UseFormReturn<FormValues>;
  categories: Category[];
  availableSubcategories: Subcategory[];
}

const CategorySelection: React.FC<CategorySelectionProps> = ({
  form,
  categories,
  availableSubcategories,
}) => {
  // Watch form values to ensure component updates
  const watchedCategories = form.watch('categories');
  const watchedSubcategories = form.watch('subcategories');
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    console.log('CategorySelection - watchedCategories:', watchedCategories);
    console.log(
      'CategorySelection - watchedSubcategories:',
      watchedSubcategories
    );
    console.log(
      'CategorySelection - availableSubcategories:',
      availableSubcategories
    );

    // Force a re-render when form values change
    setForceUpdate((prev) => prev + 1);
  }, [watchedCategories, watchedSubcategories, availableSubcategories]);

  // Force re-render when component mounts or when key changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceUpdate((prev) => prev + 1);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className='grid grid-cols-2 gap-4'
      key={forceUpdate}
    >
      <FormField
        control={form.control}
        name='categories'
        render={({ field }) => {
          console.log('Categories field value:', field.value);
          console.log('Watched categories:', watchedCategories);

          return (
            <FormItem className='flex flex-col'>
              <FormLabel>Categories</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant='outline'
                      role='combobox'
                      className={cn(
                        'w-full justify-between',
                        !watchedCategories || watchedCategories.length === 0
                          ? 'text-muted-foreground'
                          : ''
                      )}
                    >
                      {watchedCategories && watchedCategories.length > 0
                        ? categories.find(
                            (cat) => cat._id === watchedCategories[0]
                          )?.name || 'Select categories'
                        : 'Select categories'}
                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-full p-0'>
                  <Command>
                    <CommandInput placeholder='Search categories...' />
                    <CommandEmpty>No category found.</CommandEmpty>
                    <CommandGroup>
                      {categories.map((category) => (
                        <CommandItem
                          key={category._id}
                          value={category._id}
                          onSelect={() => {
                            console.log('Selecting category:', category._id);
                            field.onChange([category._id]);
                            // Clear subcategories when category changes
                            form.setValue('subcategories', []);
                          }}
                        >
                          {category.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      {/* Subcategories FormField */}
      {availableSubcategories.length > 0 && (
        <FormField
          control={form.control}
          name='subcategories'
          render={({ field }) => {
            console.log('Subcategories field value:', field.value);
            console.log('Watched subcategories:', watchedSubcategories);

            return (
              <FormItem className='flex flex-col'>
                <FormLabel>Subcategories</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant='outline'
                        role='combobox'
                        className={cn(
                          'w-full justify-between',
                          !watchedSubcategories ||
                            watchedSubcategories.length === 0
                            ? 'text-muted-foreground'
                            : ''
                        )}
                      >
                        {watchedSubcategories && watchedSubcategories.length > 0
                          ? watchedSubcategories
                              .map(
                                (subId) =>
                                  availableSubcategories.find(
                                    (sub) => sub._id === subId
                                  )?.name
                              )
                              .filter(Boolean)
                              .join(', ')
                          : 'Select subcategories'}
                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-full p-0'>
                    <Command>
                      <CommandInput placeholder='Search subcategories...' />
                      <CommandEmpty>No subcategory found.</CommandEmpty>
                      <CommandGroup>
                        {availableSubcategories.map((subcategory) => (
                          <CommandItem
                            key={subcategory._id}
                            value={subcategory._id}
                            onSelect={() => {
                              const currentValue = watchedSubcategories || [];
                              const newValue = currentValue.includes(
                                subcategory._id
                              )
                                ? currentValue.filter(
                                    (id) => id !== subcategory._id
                                  )
                                : [...currentValue, subcategory._id];
                              console.log('Setting subcategories:', newValue);
                              field.onChange(newValue);
                            }}
                          >
                            {subcategory.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      )}
    </div>
  );
};

export default CategorySelection;
