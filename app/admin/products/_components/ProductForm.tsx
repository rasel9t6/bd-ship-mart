'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import MultiSelect from '@/ui/custom/MultiSelect';
import MediaUpload, { MediaType } from '@/ui/custom/MediaUpload';
import MultiText from '@/ui/custom/MultiText';
import { Plus, Trash2 } from 'lucide-react';
import slugify from 'slugify';

// Define the form schema with Zod
const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  subcategories: z.array(z.string()).optional(),
  inputCurrency: z.enum(['CNY', 'USD']),
  price: z.object({
    cny: z.number().min(0).optional(),
    usd: z.number().min(0).optional(),
    bdt: z.number().min(0).optional(),
  }),
  expense: z.object({
    cny: z.number().min(0).optional(),
    usd: z.number().min(0).optional(),
    bdt: z.number().min(0).optional(),
  }),
  currencyRates: z.object({
    usdToBdt: z.number().min(0),
    cnyToBdt: z.number().min(0),
  }),
  minimumOrderQuantity: z.number().min(1),
  media: z.array(
    z.object({
      url: z.string().url(),
      type: z.enum(['image']),
    })
  ),
  colors: z.array(
    z.object({
      url: z.string().url(),
      type: z.enum(['image', 'video']),
    })
  ),
  sizes: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  quantityPricing: z.object({
    ranges: z
      .array(
        z.object({
          minQuantity: z.number().min(1),
          maxQuantity: z.number().min(1).optional(),
          price: z.object({
            cny: z.number().min(0).optional(),
            usd: z.number().min(0).optional(),
            bdt: z.number().min(0).optional(),
          }),
        })
      )
      .optional(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface CategoryField {
  _id?: string;
  id?: string;
  name: string;
  subcategories: Array<{
    _id: string;
    name: string;
  }>;
}

interface Category {
  _id: string;
  name: string;
  subcategories: Array<{
    _id: string;
    name: string;
  }>;
}

interface CategoryResponse {
  _id: string;
  name: string;
  subcategories: Array<{
    _id: string;
    name: string;
  }>;
}

interface ProductFormType {
  _id: string;
  title: string;
  description?: string;
  sku: string;
  slug?: string;
  category?: CategoryField;
  subcategory?: string;
  subcategories?: string[];
  inputCurrency: 'CNY' | 'USD';
  price: {
    cny?: number;
    usd?: number;
    bdt?: number;
  };
  expense: {
    cny?: number;
    usd?: number;
    bdt?: number;
  };
  currencyRates: {
    usdToBdt: number;
    cnyToBdt: number;
  };
  minimumOrderQuantity: number;
  media: MediaItem[];
  colors?: MediaItem[];
  tags?: string[];
  sizes?: string[];
}

interface MediaItem {
  url: string;
  type: 'image';
}

interface Props {
  initialData?: ProductFormType;
}

export default function ProductForm({ initialData }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category['subcategories']>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    []
  );

  // Initialize form with React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      sku: initialData?.sku || '',
      category:
        typeof initialData?.category === 'object'
          ? String(initialData.category._id || initialData.category.id || '')
          : '',
      subcategories: initialData?.subcategories || [],
      inputCurrency: (initialData?.inputCurrency as 'CNY' | 'USD') || 'CNY',
      price: {
        cny: initialData?.price?.cny || 0,
        usd: initialData?.price?.usd || 0,
        bdt: initialData?.price?.bdt || 0,
      },
      expense: {
        cny: initialData?.expense?.cny || 0,
        usd: initialData?.expense?.usd || 0,
        bdt: initialData?.expense?.bdt || 0,
      },
      currencyRates: {
        usdToBdt: initialData?.currencyRates?.usdToBdt || 121.5,
        cnyToBdt: initialData?.currencyRates?.cnyToBdt || 17.5,
      },
      minimumOrderQuantity: initialData?.minimumOrderQuantity || 1,
      media: initialData?.media || [],
      colors: initialData?.colors || [],
      tags: initialData?.tags || [],
      sizes: initialData?.sizes || [],
    },
  });

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data: CategoryResponse[] = await res.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  // Fetch subcategories when category changes
  const handleCategoryChange = async (categoryId: string) => {
    try {
      // Find the selected category from the already fetched categories
      const selectedCategory = categories.find((cat) => cat._id === categoryId);

      if (selectedCategory && selectedCategory.subcategories) {
        // Map the subcategories to the format expected by MultiSelect
        const formattedSubcategories = selectedCategory.subcategories.map(
          (sub) => ({
            _id: sub._id,
            name: sub.name,
          })
        );

        setSubcategories(formattedSubcategories);
        setSelectedSubcategories([]); // Reset selected subcategories when category changes
      } else {
        setSubcategories([]);
        setSelectedSubcategories([]);
      }
    } catch (error) {
      console.error('Error handling category change:', error);
      toast.error('Failed to load subcategories');
    }
  };

  // Handle subcategory selection
  const handleSubcategoryChange = (subcategoryId: string) => {
    setSelectedSubcategories((prev) => [...prev, subcategoryId]);
    form.setValue('subcategories', [...selectedSubcategories, subcategoryId]);
  };

  const handleSubcategoryRemove = (subcategoryId: string) => {
    setSelectedSubcategories((prev) =>
      prev.filter((id) => id !== subcategoryId)
    );
    form.setValue(
      'subcategories',
      selectedSubcategories.filter((id) => id !== subcategoryId)
    );
  };

  // Handle currency conversion
  const handleCurrencyChange = (values: FormValues) => {
    const { inputCurrency, price, expense, currencyRates } = values;
    const { usdToBdt, cnyToBdt } = currencyRates;

    // Handle price conversion
    if (inputCurrency === 'CNY') {
      if (price.cny) {
        form.setValue('price.bdt', price.cny * cnyToBdt);
        form.setValue('price.usd', price.cny / 7); // Assuming 1 USD = 7 CNY
      } else {
        form.setValue('price.bdt', 0);
        form.setValue('price.usd', 0);
      }
    } else if (inputCurrency === 'USD') {
      if (price.usd) {
        form.setValue('price.bdt', price.usd * usdToBdt);
        form.setValue('price.cny', price.usd * 7);
      } else {
        form.setValue('price.bdt', 0);
        form.setValue('price.cny', 0);
      }
    }

    // Handle expense conversion
    if (inputCurrency === 'CNY') {
      if (expense.cny) {
        form.setValue('expense.bdt', expense.cny * cnyToBdt);
        form.setValue('expense.usd', expense.cny / 7);
      } else {
        form.setValue('expense.bdt', 0);
        form.setValue('expense.usd', 0);
      }
    } else if (inputCurrency === 'USD') {
      if (expense.usd) {
        form.setValue('expense.bdt', expense.usd * usdToBdt);
        form.setValue('expense.cny', expense.usd * 7);
      } else {
        form.setValue('expense.bdt', 0);
        form.setValue('expense.cny', 0);
      }
    }
  };

  // Handle media upload
  const handleMediaChange = (url: string, type: MediaType) => {
    if (type === 'image') {
      form.setValue('media', [{ url, type }]);
    }
  };

  const handleMediaRemove = () => {
    form.setValue('media', []);
  };

  // Handle color variant images
  const handleColorChange = (url: string, type: MediaType) => {
    const currentColors = form.getValues('colors') || [];
    form.setValue('colors', [...currentColors, { url, type }]);
  };

  const handleColorRemove = (urlToRemove: string) => {
    const currentColors = form.getValues('colors') || [];
    form.setValue(
      'colors',
      currentColors.filter((color) => color.url !== urlToRemove)
    );
  };

  // Add handlers for sizes and tags
  const handleSizeChange = (size: string) => {
    const currentSizes = form.getValues('sizes') || [];
    form.setValue('sizes', [...currentSizes, size]);
  };

  const handleSizeRemove = (sizeToRemove: string) => {
    const currentSizes = form.getValues('sizes') || [];
    form.setValue(
      'sizes',
      currentSizes.filter((size) => size !== sizeToRemove)
    );
  };

  const handleTagChange = (tag: string) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', [...currentTags, tag]);
  };

  const handleTagRemove = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue(
      'tags',
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  // Add handlers for quantity pricing
  const handleAddRange = () => {
    const currentRanges = form.getValues('quantityPricing.ranges') || [];
    const newRange = {
      minQuantity: 1,
      maxQuantity: undefined,
      price: {
        cny: 0,
        usd: 0,
        bdt: 0,
      },
    };
    form.setValue('quantityPricing.ranges', [...currentRanges, newRange]);
  };

  const handleRemoveRange = (index: number) => {
    const currentRanges = form.getValues('quantityPricing.ranges') || [];
    form.setValue(
      'quantityPricing.ranges',
      currentRanges.filter((_, i) => i !== index)
    );
  };

  const handleRangeChange = (
    index: number,
    field: 'minQuantity' | 'maxQuantity' | 'price',
    value: number | undefined
  ) => {
    const currentRanges = form.getValues('quantityPricing.ranges') || [];
    const updatedRanges = [...currentRanges];

    if (field === 'price') {
      const currency = form.getValues('inputCurrency').toLowerCase() as
        | 'cny'
        | 'usd';
      updatedRanges[index] = {
        ...updatedRanges[index],
        price: {
          ...updatedRanges[index].price,
          [currency]: value,
        },
      };
    } else {
      updatedRanges[index] = {
        ...updatedRanges[index],
        [field]: value,
      };
    }

    form.setValue('quantityPricing.ranges', updatedRanges);
    handleCurrencyChange(form.getValues());
  };

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      const endpoint = initialData?._id
        ? `/api/products/${initialData.slug}`
        : '/api/products';
      const method = initialData?._id ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          slug:
            initialData?.slug ||
            slugify(values.title, { lower: true, strict: true }),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong');
      }

      toast.success(
        initialData?._id
          ? 'Product updated successfully'
          : 'Product created successfully'
      );
      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(
        error instanceof Error ? error.message : 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-8'
      >
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder='Product title'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Product description'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='sku'
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU</FormLabel>
              <FormControl>
                <Input
                  placeholder='Product SKU'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='category'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleCategoryChange(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a category' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category._id}
                        value={category._id}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Subcategories</FormLabel>
            <MultiSelect
              placeholder='Select subcategories'
              categories={subcategories}
              value={selectedSubcategories}
              onChange={handleSubcategoryChange}
              onRemove={handleSubcategoryRemove}
            />
          </FormItem>
        </div>
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
                    {...field}
                    onChange={(e) => {
                      field.onChange(parseFloat(e.target.value));
                      handleCurrencyChange(form.getValues());
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
                    {...field}
                    onChange={(e) => {
                      field.onChange(parseFloat(e.target.value));
                      handleCurrencyChange(form.getValues());
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
                    handleCurrencyChange({
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
                <FormLabel>Price ({form.getValues('inputCurrency')})</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder={`Enter price in ${form.getValues('inputCurrency')}`}
                    value={
                      field.value[
                        form.getValues('inputCurrency').toLowerCase() as
                          | 'cny'
                          | 'usd'
                      ] || ''
                    }
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      const currency = form
                        .getValues('inputCurrency')
                        .toLowerCase() as 'cny' | 'usd';
                      field.onChange({
                        ...field.value,
                        [currency]: value,
                      });
                      handleCurrencyChange({
                        ...form.getValues(),
                        price: {
                          ...form.getValues('price'),
                          [currency]: value,
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
                  Expense ({form.getValues('inputCurrency')})
                </FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder={`Enter expense in ${form.getValues('inputCurrency')}`}
                    value={
                      field.value[
                        form.getValues('inputCurrency').toLowerCase() as
                          | 'cny'
                          | 'usd'
                      ] || ''
                    }
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      const currency = form
                        .getValues('inputCurrency')
                        .toLowerCase() as 'cny' | 'usd';
                      field.onChange({
                        ...field.value,
                        [currency]: value,
                      });
                      handleCurrencyChange({
                        ...form.getValues(),
                        expense: {
                          ...form.getValues('expense'),
                          [currency]: value,
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
                placeholder='BDT Expense'
                value={form.watch('expense.bdt') || ''}
                disabled
                className='bg-muted'
              />
            </FormControl>
          </FormItem>
        </div>

        <FormField
          control={form.control}
          name='minimumOrderQuantity'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Order Quantity</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='space-y-4'>
          <FormLabel>Product Media</FormLabel>
          <MediaUpload
            value={form.watch('media') || []}
            onChange={handleMediaChange}
            onRemove={handleMediaRemove}
            multiple={false}
            accept={['image']}
            folderId='products'
          />
        </div>

        <div className='space-y-4'>
          <FormLabel>Product Variant Images</FormLabel>
          <MediaUpload
            value={form.watch('colors') || []}
            onChange={handleColorChange}
            onRemove={handleColorRemove}
            multiple={true}
            accept={['image', 'video']}
            folderId='products/variants'
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <FormItem>
            <FormLabel>Sizes</FormLabel>
            <MultiText
              placeholder='Add sizes (e.g., S, M, L)'
              value={form.watch('sizes') || []}
              onChange={handleSizeChange}
              onRemove={handleSizeRemove}
            />
          </FormItem>

          <FormItem>
            <FormLabel>Tags</FormLabel>
            <MultiText
              placeholder='Add tags (e.g., summer, casual)'
              value={form.watch('tags') || []}
              onChange={handleTagChange}
              onRemove={handleTagRemove}
            />
          </FormItem>
        </div>

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <FormLabel>Quantity Pricing Ranges</FormLabel>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleAddRange}
            >
              <Plus className='mr-2 h-4 w-4' />
              Add Range
            </Button>
          </div>

          {form.watch('quantityPricing.ranges')?.map((range, index) => (
            <div
              key={index}
              className='grid grid-cols-4 gap-4 rounded-lg border p-4'
            >
              <FormItem>
                <FormLabel>Min Quantity</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={1}
                    value={range.minQuantity || ''}
                    onChange={(e) =>
                      handleRangeChange(
                        index,
                        'minQuantity',
                        parseInt(e.target.value)
                      )
                    }
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel>Max Quantity</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={range.minQuantity || 1}
                    value={range.maxQuantity || ''}
                    placeholder='No limit'
                    onChange={(e) =>
                      handleRangeChange(
                        index,
                        'maxQuantity',
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel>Price ({form.getValues('inputCurrency')})</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    value={
                      range.price[
                        form.getValues('inputCurrency').toLowerCase() as
                          | 'cny'
                          | 'usd'
                      ] || ''
                    }
                    onChange={(e) =>
                      handleRangeChange(
                        index,
                        'price',
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel>BDT Price (Calculated)</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    value={range.price.bdt || ''}
                    disabled
                    className='bg-muted'
                  />
                </FormControl>
              </FormItem>

              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='col-span-4 mt-2 hover:!bg-danger'
                onClick={() => handleRemoveRange(index)}
              >
                <Trash2 className='size-4 ' />
              </Button>
            </div>
          ))}
        </div>

        <Button
          type='submit'
          disabled={loading}
        >
          {loading
            ? 'Saving...'
            : initialData
              ? 'Update Product'
              : 'Create Product'}
        </Button>
      </form>
    </Form>
  );
}
