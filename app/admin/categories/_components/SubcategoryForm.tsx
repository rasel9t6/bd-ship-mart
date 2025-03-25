import { Button } from '@/ui/button';
import MediaUpload from '@/ui/custom/MediaUpload';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/ui/form';
import { Input } from '@/ui/input';
import { Switch } from '@/ui/switch';
import { Textarea } from '@/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
type Subcategory = {
  shippingCharge: {
    byAir: { min: number; max: number };
    bySea: { min: number; max: number };
  };
  name: string;
  title: string;
  description: string;
  icon: string;
  thumbnail: string;
  isActive: boolean;
  sortOrder: number;
  parentId: string;
};
const subcategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  icon: z.string(),
  thumbnail: z.string(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  parentId: z.string(),
  shippingCharge: z
    .object({
      byAir: z.object({
        min: z
          .number()
          .min(0, 'Min shipping charge must be positive')
          .default(0),
        max: z
          .number()
          .min(0, 'Max shipping charge must be positive')
          .default(0),
      }),
      bySea: z.object({
        min: z
          .number()
          .min(0, 'Min shipping charge must be positive')
          .default(0),
        max: z
          .number()
          .min(0, 'Max shipping charge must be positive')
          .default(0),
      }),
    })
    .default({
      byAir: { min: 0, max: 0 },
      bySea: { min: 0, max: 0 },
    }),
});
const SubcategoryDialogForm = ({
  onSubmit,
}: {
  onSubmit: (subcategoryData: Subcategory) => void;
}) => {
  const subcategoryForm = useForm<Subcategory>({
    resolver: zodResolver(subcategorySchema),
    defaultValues: {
      name: '',
      title: '',
      description: '',
      isActive: true,
      sortOrder: 0,
      shippingCharge: {
        byAir: { min: 0, max: 0 },
        bySea: { min: 0, max: 0 },
      },
      icon: '',
      thumbnail: '',
      parentId: '',
    },
  });

  const handleSubmit = (data: Subcategory) => {
    onSubmit(data);
    subcategoryForm.reset();
  };

  return (
    <Form {...subcategoryForm}>
      <form
        onSubmit={subcategoryForm.handleSubmit(handleSubmit)}
        className='space-y-4'
      >
        <div className='grid md:grid-cols-2 gap-4'>
          <FormField
            control={subcategoryForm.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subcategory Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Enter subcategory name'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={subcategoryForm.control}
            name='title'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subcategory Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Enter subcategory title'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={subcategoryForm.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Enter subcategory description'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='grid md:grid-cols-2 gap-4'>
          <FormField
            control={subcategoryForm.control}
            name='icon'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon</FormLabel>
                <FormControl>
                  <MediaUpload
                    value={
                      field.value ? [{ url: field.value, type: 'image' }] : []
                    }
                    onChange={(url) => field.onChange(url)}
                    onRemove={() => field.onChange('')}
                    folderId='icons'
                    multiple={false}
                    accept={['image']} // Only allow images for icon
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={subcategoryForm.control}
            name='thumbnail'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thumbnail</FormLabel>
                <FormControl>
                  <MediaUpload
                    value={
                      field.value ? [{ url: field.value, type: 'image' }] : []
                    }
                    onChange={(url) => field.onChange(url)}
                    onRemove={() => field.onChange('')}
                    folderId='thumbnails'
                    multiple={false}
                    accept={['image']}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='grid md:grid-cols-2 gap-4'>
          <FormField
            control={subcategoryForm.control}
            name='isActive'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <FormLabel>Active Status</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={subcategoryForm.control}
            name='sortOrder'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sort Order</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='Enter sort order'
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex justify-end gap-4'>
          <Button type='button'>Add Subcategory</Button>
        </div>
      </form>
    </Form>
  );
};
export default SubcategoryDialogForm;
