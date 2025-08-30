import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MediaType } from '@/ui/custom/MediaUpload';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/ui/form';
import { Input } from '@/ui/input';
import MediaUpload from '@/ui/custom/MediaUpload';
import MultiText from '@/ui/custom/MultiText';
import { FormValues } from './types';

interface ProductDetailsProps {
  form: UseFormReturn<FormValues>;
  onMediaChange: (url: string, type: MediaType) => void;
  onMediaRemove: () => void;
  onColorChange: (url: string, type: MediaType) => void;
  onColorRemove: (urlToRemove: string) => void;
  onSizeChange: (size: string) => void;
  onSizeRemove: (sizeToRemove: string) => void;
  onTagChange: (tag: string) => void;
  onTagRemove: (tagToRemove: string) => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  form,
  onMediaChange,
  onMediaRemove,
  onColorChange,
  onColorRemove,
  onSizeChange,
  onSizeRemove,
  onTagChange,
  onTagRemove,
}) => {
  return (
    <div className='space-y-8'>
      <FormField
        control={form.control}
        name='minimumOrderQuantity'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Minimum Order Quantity</FormLabel>
            <FormControl>
              <Input
                type='number'
                min='1'
                {...field}
                onChange={(e) => {
                  field.onChange(parseInt(e.target.value));
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='media'
        render={() => (
          <FormItem>
            <FormLabel>Media</FormLabel>
            <FormControl>
              <MediaUpload
                value={form.watch('media') || []}
                onChange={onMediaChange}
                onRemove={onMediaRemove}
                multiple={false}
                accept={['image']}
                folderId='products'
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='colors'
        render={() => (
          <FormItem>
            <FormLabel>Colors</FormLabel>
            <FormControl>
              <MediaUpload
                value={form.watch('colors') || []}
                onChange={onColorChange}
                onRemove={onColorRemove}
                multiple={true}
                accept={['image', 'video']}
                folderId='products/variants'
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='sizes'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sizes</FormLabel>
            <FormControl>
              <MultiText
                placeholder='Add sizes (e.g., S, M, L)'
                value={field.value || []}
                onChange={onSizeChange}
                onRemove={onSizeRemove}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='tags'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tags</FormLabel>
            <FormControl>
              <MultiText
                placeholder='Add tags (e.g., summer, casual)'
                value={field.value || []}
                onChange={onTagChange}
                onRemove={onTagRemove}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ProductDetails;
