'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button } from '@/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/ui/form';
import { Input } from '@/ui/input';
import { ImageIcon, Plus, Trash2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/dialog';
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { Textarea } from '@/ui/textarea';
import { Switch } from '@/ui/switch';
import SubcategoryDialogForm from './SubcategoryForm';
import MediaUpload from '@/ui/custom/MediaUpload';

// Types and Schemas (unchanged from original)
type Subcategory = {
  shippingCharge: {
    byAir: { min: number; max: number };
    bySea: { min: number; max: number };
  };
  name: string;
  slug: string;
  title: string;
  description?: string;
  icon?: string;
  thumbnail?: string;
  isActive: boolean;
  sortOrder: number;
  parentId: string;
};

interface CategoryFormProps {
  initialData?: {
    shippingCharge: {
      byAir: { min: number; max: number };
      bySea: { min: number; max: number };
    };
    _id: string;
    slug: string;
    name: string;
    title: string;
    description?: string;
    icon: string;
    thumbnail: string;
    isActive: boolean;
    sortOrder: number;
    subcategories: Subcategory[];
  } | null;
}

const subcategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  thumbnail: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  parentId: z.string().optional(),
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

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  icon: z.string().min(1, 'Icon is required'),
  thumbnail: z.string().min(1, 'Thumbnail is required'),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
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
  subcategories: z.array(subcategorySchema).default([]),
});

type FormValues = z.infer<typeof formSchema>;

const CategoryForm = ({ initialData }: CategoryFormProps) => {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          shippingCharge: initialData.shippingCharge || {
            byAir: { min: 0, max: 0 },
            bySea: { min: 0, max: 0 },
          },
          subcategories:
            initialData.subcategories.map((sub) => ({
              ...sub,
              parentId: initialData._id,
              shippingCharge: sub.shippingCharge || {
                byAir: { min: 0, max: 0 },
                bySea: { min: 0, max: 0 },
              },
            })) || [],
        }
      : {
          name: '',
          title: '',
          description: '',
          icon: '',
          thumbnail: '',
          isActive: true,
          sortOrder: 0,
          shippingCharge: {
            byAir: { min: 0, max: 0 },
            bySea: { min: 0, max: 0 },
          },
          subcategories: [],
        },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'subcategories',
  });

  const handleFormSubmit = async (values: FormValues) => {
    try {
      const formattedData = {
        ...values,
        subcategories: values.subcategories.map((sub, index) => ({
          ...sub,
          sortOrder: index,
          parentId: initialData?._id || '',
        })),
      };

      const url = initialData
        ? `/api/categories/${initialData.slug}`
        : '/api/categories';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.STORE_API_KEY}`,
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save category');
      }

      toast.success(
        `Category ${initialData ? 'updated' : 'created'} successfully`
      );
      router.push('/categories');
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to save category'
      );
      console.error('Category submission error:', error);
    } finally {
    }
  };

  return (
    <div className='container mx-auto px-4 py-8 lg:pl-72'>
      <Card className='w-full max-w-4xl mx-auto'>
        <CardHeader>
          <CardTitle>
            {initialData ? 'Edit Category' : 'Create Category'}
          </CardTitle>
          <CardDescription>
            Manage your category details and shipping information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className='space-y-8'
            >
              {/* Main category form fields (same as original) */}
              {/* ... (previous fields remain the same) ... */}
              <div className='grid md:grid-cols-2 gap-6'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter category name'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter category title'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Describe your category'
                        className='min-h-[120px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Shipping Charges */}
              <Accordion
                type='single'
                collapsible
              >
                <AccordionItem value='shipping-charges'>
                  <AccordionTrigger>Shipping Charges (BDT)</AccordionTrigger>
                  <AccordionContent>
                    <Tabs defaultValue='air'>
                      <TabsList className='grid w-full grid-cols-2'>
                        <TabsTrigger
                          value='air'
                          className='data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300'
                        >
                          By Air
                        </TabsTrigger>
                        <TabsTrigger
                          value='sea'
                          className='data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300'
                        >
                          By Sea
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value='air'>
                        <div className='grid md:grid-cols-2 gap-4 mt-4'>
                          <FormField
                            control={form.control}
                            name='shippingCharge.byAir.min'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Min Charge</FormLabel>
                                <FormControl>
                                  <Input
                                    type='number'
                                    placeholder='Minimum air charge'
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name='shippingCharge.byAir.max'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Max Charge</FormLabel>
                                <FormControl>
                                  <Input
                                    type='number'
                                    placeholder='Maximum air charge'
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>
                      <TabsContent value='sea'>
                        <div className='grid md:grid-cols-2 gap-4 mt-4'>
                          <FormField
                            control={form.control}
                            name='shippingCharge.bySea.min'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Min Charge</FormLabel>
                                <FormControl>
                                  <Input
                                    type='number'
                                    placeholder='Minimum sea charge'
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name='shippingCharge.bySea.max'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Max Charge</FormLabel>
                                <FormControl>
                                  <Input
                                    type='number'
                                    placeholder='Maximum sea charge'
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Media Uploads */}
              <div className='grid md:grid-cols-2 gap-6'>
                <FormField
                  control={form.control}
                  name='icon'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon</FormLabel>
                      <FormControl>
                        <MediaUpload
                          value={
                            field.value
                              ? [{ url: field.value, type: 'image' }]
                              : []
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
                  control={form.control}
                  name='thumbnail'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thumbnail</FormLabel>
                      <FormControl>
                        <MediaUpload
                          value={
                            field.value
                              ? [{ url: field.value, type: 'image' }]
                              : []
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

              {/* Additional Settings */}
              <div className='grid md:grid-cols-2 gap-6'>
                <FormField
                  control={form.control}
                  name='sortOrder'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='Enter sort order'
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
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
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              {/* Subcategories Section */}
              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <h2 className='text-xl font-semibold'>Subcategories</h2>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                      >
                        <Plus className='mr-2 h-4 w-4' /> Add Subcategory
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='sm:max-w-[600px]'>
                      <DialogHeader>
                        <DialogTitle>Add Subcategory</DialogTitle>
                      </DialogHeader>
                      <SubcategoryDialogForm
                        onSubmit={(subcategoryData) => {
                          append(subcategoryData);
                          // This will close the dialog automatically
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>

                {fields.map((field, index) => (
                  <Card
                    key={field.id}
                    className='relative'
                  >
                    <CardHeader>
                      <CardTitle>Subcategory {index + 1}</CardTitle>
                      <Button
                        type='button'
                        variant='destructive'
                        size='icon'
                        className='absolute top-4 right-4'
                        onClick={() => remove(index)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className='grid md:grid-cols-2 gap-4'>
                        <FormField
                          control={form.control}
                          name={`subcategories.${index}.name`}
                          render={({ field: inputField }) => (
                            <FormItem>
                              <FormLabel>Subcategory Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='Enter subcategory name'
                                  {...inputField}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`subcategories.${index}.title`}
                          render={({ field: inputField }) => (
                            <FormItem>
                              <FormLabel>Subcategory Title</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='Enter subcategory title'
                                  {...inputField}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Additional Subcategory Fields */}
                        <FormField
                          control={form.control}
                          name={`subcategories.${index}.description`}
                          render={({ field: inputField }) => (
                            <FormItem className='md:col-span-2'>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder='Enter subcategory description'
                                  {...inputField}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`subcategories.${index}.isActive`}
                          render={({ field: inputField }) => (
                            <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                              <FormLabel>Active Status</FormLabel>
                              <FormControl>
                                <Switch
                                  checked={inputField.value}
                                  onCheckedChange={inputField.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`subcategories.${index}.sortOrder`}
                          render={({ field: inputField }) => (
                            <FormItem>
                              <FormLabel>Sort Order</FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  placeholder='Enter sort order'
                                  {...inputField}
                                  onChange={(e) =>
                                    inputField.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Shipping Charges for Subcategory */}
                      <Accordion
                        type='single'
                        collapsible
                        className='mt-4'
                      >
                        <AccordionItem value='shipping-charges'>
                          <AccordionTrigger>
                            Shipping Charges (BDT)
                          </AccordionTrigger>
                          <AccordionContent>
                            <Tabs defaultValue='air'>
                              <TabsList className='grid w-full grid-cols-2'>
                                <TabsTrigger value='air'>By Air</TabsTrigger>
                                <TabsTrigger value='sea'>By Sea</TabsTrigger>
                              </TabsList>
                              <TabsContent value='air'>
                                <div className='grid md:grid-cols-2 gap-4 mt-4'>
                                  <FormField
                                    control={form.control}
                                    name={`subcategories.${index}.shippingCharge.byAir.min`}
                                    render={({ field: inputField }) => (
                                      <FormItem>
                                        <FormLabel>Min Charge</FormLabel>
                                        <FormControl>
                                          <Input
                                            type='number'
                                            placeholder='Minimum air charge'
                                            {...inputField}
                                            onChange={(e) =>
                                              inputField.onChange(
                                                Number(e.target.value)
                                              )
                                            }
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name={`subcategories.${index}.shippingCharge.byAir.max`}
                                    render={({ field: inputField }) => (
                                      <FormItem>
                                        <FormLabel>Max Charge</FormLabel>
                                        <FormControl>
                                          <Input
                                            type='number'
                                            placeholder='Maximum air charge'
                                            {...inputField}
                                            onChange={(e) =>
                                              inputField.onChange(
                                                Number(e.target.value)
                                              )
                                            }
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </TabsContent>
                              <TabsContent value='sea'>
                                <div className='grid md:grid-cols-2 gap-4 mt-4'>
                                  <FormField
                                    control={form.control}
                                    name={`subcategories.${index}.shippingCharge.bySea.min`}
                                    render={({ field: inputField }) => (
                                      <FormItem>
                                        <FormLabel>Min Charge</FormLabel>
                                        <FormControl>
                                          <Input
                                            type='number'
                                            placeholder='Minimum sea charge'
                                            {...inputField}
                                            onChange={(e) =>
                                              inputField.onChange(
                                                Number(e.target.value)
                                              )
                                            }
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name={`subcategories.${index}.shippingCharge.bySea.max`}
                                    render={({ field: inputField }) => (
                                      <FormItem>
                                        <FormLabel>Max Charge</FormLabel>
                                        <FormControl>
                                          <Input
                                            type='number'
                                            placeholder='Maximum sea charge'
                                            {...inputField}
                                            onChange={(e) =>
                                              inputField.onChange(
                                                Number(e.target.value)
                                              )
                                            }
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </TabsContent>
                            </Tabs>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      {/* Media Uploads for Subcategory */}
                      <div className='grid md:grid-cols-2 gap-4 mt-4'>
                        <FormField
                          control={form.control}
                          name={`subcategories.${index}.icon`}
                          render={({ field: inputField }) => (
                            <FormItem>
                              <FormLabel>Subcategory Icon</FormLabel>
                              <FormControl>
                                <div className='flex items-center space-x-4'>
                                  {inputField.value ? (
                                    <div className='relative'>
                                      <Image
                                        src={inputField.value}
                                        alt='Subcategory Icon'
                                        className='w-20 h-20 object-cover rounded-md'
                                      />
                                      <button
                                        type='button'
                                        onClick={() => inputField.onChange('')}
                                        className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1'
                                      >
                                        <X className='w-4 h-4' />
                                      </button>
                                    </div>
                                  ) : (
                                    <Button
                                      type='button'
                                      variant='outline'
                                      className='flex items-center gap-2'
                                    >
                                      <ImageIcon className='w-4 h-4' />
                                      Upload Icon
                                    </Button>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`subcategories.${index}.thumbnail`}
                          render={({ field: inputField }) => (
                            <FormItem>
                              <FormLabel>Subcategory Thumbnail</FormLabel>
                              <FormControl>
                                <div className='flex items-center space-x-4'>
                                  {inputField.value ? (
                                    <div className='relative'>
                                      <Image
                                        src={inputField.value}
                                        alt='Subcategory Thumbnail'
                                        className='w-20 h-20 object-cover rounded-md'
                                      />
                                      <button
                                        type='button'
                                        onClick={() => inputField.onChange('')}
                                        className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1'
                                      >
                                        <X className='w-4 h-4' />
                                      </button>
                                    </div>
                                  ) : (
                                    <Button
                                      type='button'
                                      variant='outline'
                                      className='flex items-center gap-2'
                                    >
                                      <ImageIcon className='w-4 h-4' />
                                      Upload Thumbnail
                                    </Button>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Action Buttons */}
              <div className='flex justify-end gap-4'>
                <Button
                  type='button'
                  variant='outline'
                  asChild
                >
                  <Link href='/categories'>Cancel</Link>
                </Button>
                <Button
                  type='submit'
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? 'Saving...'
                    : `Save ${initialData ? 'Changes' : 'Category'}`}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryForm;
