import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Button } from '@/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/card';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/ui/form';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { Checkbox } from '@/ui/checkbox';
import { FormValues } from './types';
import MediaUploadSection from './MediaUploadSection';
import ShippingChargeSection from './ShippingChargeSection';

interface SubcategoryFormProps {
  form: UseFormReturn<FormValues>;
  index: number;
  onRemove: (index: number) => void;
}

const SubcategoryForm: React.FC<SubcategoryFormProps> = ({
  form,
  index,
  onRemove,
}) => {
  return (
    <Card
      key={index}
      className='border'
    >
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <h3 className='text-lg font-medium'>Subcategory {index + 1}</h3>
        <Button
          type='button'
          variant='ghost'
          onClick={() => onRemove(index)}
          className='text-red-600 hover:text-red-700 hover:bg-red-50'
        >
          Remove
        </Button>
      </CardHeader>
      <CardContent className='space-y-4'>
        <FormField
          control={form.control}
          name={`subcategories.${index}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder='Enter subcategory name...'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`subcategories.${index}.title`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder='Enter subcategory title...'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`subcategories.${index}.description`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Describe your subcategory...'
                  className='min-h-32'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Media Upload for Subcategory */}
        <MediaUploadSection
          form={form}
          prefix={`subcategories.${index}`}
        />

        {/* Shipping Charge Section for Subcategory */}
        <ShippingChargeSection
          form={form}
          prefix={`subcategories.${index}`}
        />

        <FormField
          control={form.control}
          name={`subcategories.${index}.isActive`}
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

        <FormField
          control={form.control}
          name={`subcategories.${index}.sortOrder`}
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
      </CardContent>
    </Card>
  );
};

export default SubcategoryForm;
