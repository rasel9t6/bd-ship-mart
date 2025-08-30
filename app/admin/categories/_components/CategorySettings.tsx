import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/ui/form';
import { Input } from '@/ui/input';
import { Checkbox } from '@/ui/checkbox';
import { FormValues } from './types';

interface CategorySettingsProps {
  form: UseFormReturn<FormValues>;
}

const CategorySettings: React.FC<CategorySettingsProps> = ({ form }) => {
  return (
    <div className='space-y-6'>
      <FormField
        control={form.control}
        name='sortOrder'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sort Order</FormLabel>
            <FormControl>
              <Input
                type='number'
                placeholder='Enter sort order...'
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='isActive'
        render={({ field }) => (
          <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
            <FormLabel>Active Status</FormLabel>
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export default CategorySettings;
