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
import { FormValues } from './types';

interface ShippingChargeSectionProps {
  form: UseFormReturn<FormValues>;
  prefix?: string;
}

const ShippingChargeSection: React.FC<ShippingChargeSectionProps> = ({
  form,
  prefix = '',
}) => {
  const getFieldName = (field: string) => {
    return prefix ? `${prefix}.${field}` : field;
  };

  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold'>
        {prefix ? 'Shipping Charge' : 'Shipping Charge (BDT)'}
      </h3>

      {/* By Air */}
      <div className='grid grid-cols-2 gap-4'>
        <FormField
          control={form.control}
          name={getFieldName('shippingCharge.byAir.min')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>By Air - Min</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  min={0}
                  placeholder='Min charge for Air...'
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
          name={getFieldName('shippingCharge.byAir.max')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>By Air - Max</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  min={0}
                  placeholder='Max charge for Air...'
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* By Sea */}
      <div className='grid grid-cols-2 gap-4'>
        <FormField
          control={form.control}
          name={getFieldName('shippingCharge.bySea.min')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>By Sea - Min</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  min={0}
                  placeholder='Min charge for Sea...'
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
          name={getFieldName('shippingCharge.bySea.max')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>By Sea - Max</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  min={0}
                  placeholder='Max charge for Sea...'
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default ShippingChargeSection;
