import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/ui/form';
import MediaUpload from '@/ui/custom/MediaUpload';
import { FormValues } from './types';

interface MediaUploadSectionProps {
  form: UseFormReturn<FormValues>;
  prefix?: string;
}

const MediaUploadSection: React.FC<MediaUploadSectionProps> = ({
  form,
  prefix = '',
}) => {
  const getFieldName = (field: string) => {
    return prefix ? `${prefix}.${field}` : field;
  };

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
      <FormField
        control={form.control}
        name={getFieldName('icon')}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Icon</FormLabel>
            <FormControl>
              <MediaUpload
                value={field.value ? [{ url: field.value, type: 'image' }] : []}
                onChange={(url) => form.setValue(getFieldName('icon'), url)}
                onRemove={() => form.setValue(getFieldName('icon'), '')}
                folderId='icons'
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={getFieldName('thumbnail')}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Thumbnail</FormLabel>
            <FormControl>
              <MediaUpload
                value={field.value ? [{ url: field.value, type: 'image' }] : []}
                onChange={(url) =>
                  form.setValue(getFieldName('thumbnail'), url)
                }
                onRemove={() => form.setValue(getFieldName('thumbnail'), '')}
                folderId='thumbnails'
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default MediaUploadSection;
