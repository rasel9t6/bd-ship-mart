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

interface CurrencyRatesProps {
  form: UseFormReturn<FormValues>;
  onCurrencyChange: (values: FormValues) => void;
}

const CurrencyRates: React.FC<CurrencyRatesProps> = ({
  form,
  onCurrencyChange,
}) => {
  return (
    <div className='grid grid-cols-2 gap-4'>
      <FormField
        control={form.control}
        name='currencyRates.cnyToBdt'
        render={({ field }) => (
          <FormItem>
            <FormLabel>CNY to BDT Rate</FormLabel>
            <FormControl>
              <Input
                type='number'
                step='0.01'
                {...field}
                onChange={(e) => {
                  field.onChange(parseFloat(e.target.value));
                  onCurrencyChange(form.getValues());
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='currencyRates.usdToBdt'
        render={({ field }) => (
          <FormItem>
            <FormLabel>USD to BDT Rate</FormLabel>
            <FormControl>
              <Input
                type='number'
                step='0.01'
                {...field}
                onChange={(e) => {
                  field.onChange(parseFloat(e.target.value));
                  onCurrencyChange(form.getValues());
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default CurrencyRates;
