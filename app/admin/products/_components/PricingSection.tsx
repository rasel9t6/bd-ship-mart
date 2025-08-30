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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';
import { FormValues } from './types';

interface PricingSectionProps {
  form: UseFormReturn<FormValues>;
  onCurrencyChange: (values: FormValues) => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({
  form,
  onCurrencyChange,
}) => {
  return (
    <div className='space-y-8'>
      <div className='grid grid-cols-3 gap-4'>
        <FormField
          control={form.control}
          name='inputCurrency'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Input Currency</FormLabel>
              <Select
                onValueChange={(value: 'CNY' | 'USD') => {
                  field.onChange(value);
                  onCurrencyChange({
                    ...form.getValues(),
                    inputCurrency: value,
                  });
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select currency' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='CNY'>CNY (¥)</SelectItem>
                  <SelectItem value='USD'>USD ($)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='price'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Price ({form.getValues('inputCurrency') || 'CNY'})
              </FormLabel>
              <FormControl>
                <Input
                  type='number'
                  step='0.01'
                  placeholder={`Enter price in ${form.getValues('inputCurrency') || 'CNY'}`}
                  value={
                    (field.value || {})[
                      (
                        form.getValues('inputCurrency') || 'CNY'
                      ).toLowerCase() as 'cny' | 'usd'
                    ] || ''
                  }
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    const priceCurrency = (
                      form.getValues('inputCurrency') || 'CNY'
                    ).toLowerCase() as 'cny' | 'usd';
                    field.onChange({
                      ...(field.value || {}),
                      [priceCurrency]: value,
                    });
                    onCurrencyChange({
                      ...form.getValues(),
                      price: {
                        ...(form.getValues('price') || {}),
                        [priceCurrency]: value,
                      },
                    });
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>BDT Price (Calculated)</FormLabel>
          <FormControl>
            <Input
              type='number'
              step='0.01'
              placeholder='BDT Price'
              value={form.watch('price.bdt') || ''}
              disabled
              className='bg-muted'
            />
          </FormControl>
        </FormItem>
      </div>

      <div className='grid grid-cols-3 gap-4'>
        <FormField
          control={form.control}
          name='expense'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Expense ({form.getValues('inputCurrency') || 'CNY'})
              </FormLabel>
              <FormControl>
                <Input
                  type='number'
                  step='0.01'
                  placeholder={`Enter expense in ${form.getValues('inputCurrency') || 'CNY'}`}
                  value={
                    (field.value || {})[
                      (
                        form.getValues('inputCurrency') || 'CNY'
                      ).toLowerCase() as 'cny' | 'usd'
                    ] || ''
                  }
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    const expenseCurrency = (
                      form.getValues('inputCurrency') || 'CNY'
                    ).toLowerCase() as 'cny' | 'usd';
                    field.onChange({
                      ...(field.value || {}),
                      [expenseCurrency]: value,
                    });
                    onCurrencyChange({
                      ...form.getValues(),
                      expense: {
                        ...(form.getValues('expense') || {}),
                        [expenseCurrency]: value,
                      },
                    });
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>BDT Expense (Calculated)</FormLabel>
          <FormControl>
            <Input
              type='number'
              step='0.01'
              placeholder='BDT Expense'
              value={form.watch('expense.bdt') || ''}
              disabled
              className='bg-muted'
            />
          </FormControl>
        </FormItem>
      </div>
    </div>
  );
};

export default PricingSection;
