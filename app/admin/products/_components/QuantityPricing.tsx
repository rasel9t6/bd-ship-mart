import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { FormLabel, FormControl, FormItem } from '@/ui/form';
import { FormValues } from './types';

interface QuantityPricingProps {
  form: UseFormReturn<FormValues>;
  onAddRange: () => void;
  onRemoveRange: (index: number) => void;
  onRangeChange: (
    index: number,
    field: 'minQuantity' | 'maxQuantity' | 'price',
    value: number | undefined
  ) => void;
}

const QuantityPricing: React.FC<QuantityPricingProps> = ({
  form,
  onAddRange,
  onRemoveRange,
  onRangeChange,
}) => {
  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <FormLabel>Quantity Pricing (Optional)</FormLabel>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={onAddRange}
        >
          <Plus className='h-4 w-4 mr-2' />
          Add Range
        </Button>
      </div>

      {form.watch('quantityPricing.ranges')?.map((range, index) => (
        <div
          key={index}
          className='border p-4 rounded-lg space-y-4'
        >
          <div className='flex items-center justify-between'>
            <h4 className='text-sm font-medium'>Range {index + 1}</h4>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => onRemoveRange(index)}
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>

          <div className='grid grid-cols-4 gap-4'>
            <FormItem>
              <FormLabel>Min Quantity</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  min='1'
                  value={range.minQuantity || ''}
                  onChange={(e) =>
                    onRangeChange(
                      index,
                      'minQuantity',
                      parseInt(e.target.value)
                    )
                  }
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Max Quantity (Optional)</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  min='1'
                  value={range.maxQuantity || ''}
                  onChange={(e) =>
                    onRangeChange(
                      index,
                      'maxQuantity',
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>
                Price ({form.getValues('inputCurrency') || 'CNY'})
              </FormLabel>
              <FormControl>
                <Input
                  type='number'
                  step='0.01'
                  value={
                    (range.price || {})[
                      (
                        form.getValues('inputCurrency') || 'CNY'
                      ).toLowerCase() as 'cny' | 'usd'
                    ] || ''
                  }
                  onChange={(e) =>
                    onRangeChange(index, 'price', parseFloat(e.target.value))
                  }
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>BDT Price (Calculated)</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  step='0.01'
                  value={range.price.bdt || ''}
                  disabled
                  className='bg-muted'
                />
              </FormControl>
            </FormItem>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuantityPricing;
