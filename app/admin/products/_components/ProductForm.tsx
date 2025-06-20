'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FieldErrors } from 'react-hook-form';
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
import MediaUpload, { MediaType } from '@/ui/custom/MediaUpload';
import MultiText from '@/ui/custom/MultiText';
import { Plus, Trash2, ChevronsUpDown } from 'lucide-react';
import slugify from 'slugify';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/ui/command';

// Updated form schema to match the model structure
const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
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

interface Subcategory {
  _id: string;
  name: string;
  title: string;
  description?: string;
  shippingCharge: {
    byAir: { min: number; max: number };
    bySea: { min: number; max: number };
  };
  icon: string;
  thumbnail: string;
  products: string[];
  category: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  slug: string;
}

interface Category {
  _id: string;
  name: string;
  title: string;
  description?: string;
  subcategories: Subcategory[];
  products: string[];
  shippingCharge: {
    byAir: { min: number; max: number };
    bySea: { min: number; max: number };
  };
  isActive: boolean;
  sortOrder: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  slug: string;
}

interface ProductFormType {
  _id: string;
  title: string;
  description?: string;
  sku: string;
  slug?: string;
  categories: string[];
  subcategories: string[];
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
  quantityPricing?: {
    ranges: Array<{
      minQuantity: number;
      maxQuantity?: number;
      price: {
        cny?: number;
        usd?: number;
        bdt?: number;
      };
    }>;
  };
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
  const [availableSubcategories, setAvailableSubcategories] = useState<
    Subcategory[]
  >([]);
  const [loading, setLoading] = useState(false);

  // Initialize form with React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      sku: '',
      categories: [],
      subcategories: [],
      inputCurrency: 'CNY',
      price: {
        cny: 0,
        usd: 0,
        bdt: 0,
      },
      expense: {
        cny: 0,
        usd: 0,
        bdt: 0,
      },
      currencyRates: {
        usdToBdt: 121.5,
        cnyToBdt: 17.5,
      },
      minimumOrderQuantity: 1,
      media: [],
      colors: [],
      sizes: [],
      tags: [],
      quantityPricing: {
        ranges: [],
      },
    },
  });

  // Fetch categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesRes = await fetch('/api/categories');

        if (!categoriesRes.ok) {
          throw new Error('Failed to fetch categories');
        }

        const categoriesData: Category[] = await categoriesRes.json();
        setCategories(categoriesData);

        // Initialize selected values from initial data
        if (
          Array.isArray(initialData?.categories) &&
          initialData.categories.length > 0
        ) {
          form.setValue('categories', initialData.categories);
        }

        // Set subcategories if they exist
        if (
          Array.isArray(initialData?.subcategories) &&
          initialData.subcategories.length > 0
        ) {
          form.setValue('subcategories', initialData.subcategories);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load categories');
      }
    };
    fetchData();
  }, [initialData, form]);

  const selectedCategories = form.watch('categories');

  useEffect(() => {
    const selectedCategoryId = selectedCategories?.[0];
    if (selectedCategoryId) {
      const selectedCategory = categories.find(
        (cat) => cat._id === selectedCategoryId
      );
      if (selectedCategory?.subcategories) {
        setAvailableSubcategories(selectedCategory.subcategories);
      } else {
        setAvailableSubcategories([]);
      }
    } else {
      setAvailableSubcategories([]);
    }
  }, [selectedCategories, categories, form]);

  // Handle currency conversion
  const handleCurrencyChange = (values: FormValues) => {
    const {
      inputCurrency: selectedCurrency,
      price: currentPrice = { cny: 0, usd: 0, bdt: 0 },
      expense: currentExpense = { cny: 0, usd: 0, bdt: 0 },
      currencyRates: currentRates = { usdToBdt: 121.5, cnyToBdt: 17.5 },
    } = values;
    const { usdToBdt, cnyToBdt } = currentRates;

    // Handle price conversion
    if (selectedCurrency === 'CNY') {
      if (currentPrice.cny) {
        form.setValue('price.bdt', currentPrice.cny * cnyToBdt);
        form.setValue('price.usd', currentPrice.cny / 7);
      } else {
        form.setValue('price.bdt', 0);
        form.setValue('price.usd', 0);
      }
    } else if (selectedCurrency === 'USD') {
      if (currentPrice.usd) {
        form.setValue('price.bdt', currentPrice.usd * usdToBdt);
        form.setValue('price.cny', currentPrice.usd * 7);
      } else {
        form.setValue('price.bdt', 0);
        form.setValue('price.cny', 0);
      }
    }

    // Handle expense conversion
    if (selectedCurrency === 'CNY') {
      if (currentExpense.cny) {
        form.setValue('expense.bdt', currentExpense.cny * cnyToBdt);
        form.setValue('expense.usd', currentExpense.cny / 7);
      } else {
        form.setValue('expense.bdt', 0);
        form.setValue('expense.usd', 0);
      }
    } else if (selectedCurrency === 'USD') {
      if (currentExpense.usd) {
        form.setValue('expense.bdt', currentExpense.usd * usdToBdt);
        form.setValue('expense.cny', currentExpense.usd * 7);
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
      const rangeCurrency = (
        form.getValues('inputCurrency') || 'CNY'
      ).toLowerCase() as 'cny' | 'usd';
      updatedRanges[index] = {
        ...updatedRanges[index],
        price: {
          ...(updatedRanges[index].price || {}),
          [rangeCurrency]: value,
        },
      };

      // Calculate other currencies
      const { usdToBdt, cnyToBdt } = form.getValues('currencyRates') || {
        usdToBdt: 121.5,
        cnyToBdt: 17.5,
      };
      if (rangeCurrency === 'cny' && value) {
        updatedRanges[index].price.bdt = value * cnyToBdt;
        updatedRanges[index].price.usd = value / 7;
      } else if (rangeCurrency === 'usd' && value) {
        updatedRanges[index].price.bdt = value * usdToBdt;
        updatedRanges[index].price.cny = value * 7;
      }
    } else {
      updatedRanges[index] = {
        ...updatedRanges[index],
        [field]: value,
      };
    }

    form.setValue('quantityPricing.ranges', updatedRanges);
  };

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      const submitData = {
        ...values,
        categories: values.categories || [],
        subcategories: values.subcategories || [],
        slug:
          initialData?.slug ||
          slugify(values.title, { lower: true, strict: true }),
      };

      const endpoint = initialData?._id
        ? `/api/products/${initialData.slug}`
        : '/api/products';
      const method = initialData?._id ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
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

  // Add form error handler
  const onError = (errors: FieldErrors<FormValues>) => {
    // Get the first error message
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      toast.error(firstError.message as string);
    }
  };

  // Initialize form with default values
  useEffect(() => {
    if (initialData) {
      try {
        form.reset({
          title: initialData.title || '',
          description: initialData.description || '',
          sku: initialData.sku || '',
          categories: initialData.categories || [],
          subcategories: initialData.subcategories || [],
          inputCurrency: (initialData.inputCurrency as 'CNY' | 'USD') || 'CNY',
          price: {
            cny: initialData.price?.cny ?? 0,
            usd: initialData.price?.usd ?? 0,
            bdt: initialData.price?.bdt ?? 0,
          },
          expense: {
            cny: initialData.expense?.cny ?? 0,
            usd: initialData.expense?.usd ?? 0,
            bdt: initialData.expense?.bdt ?? 0,
          },
          currencyRates: {
            usdToBdt: initialData.currencyRates?.usdToBdt ?? 121.5,
            cnyToBdt: initialData.currencyRates?.cnyToBdt ?? 17.5,
          },
          minimumOrderQuantity: initialData.minimumOrderQuantity || 1,
          media: initialData.media || [],
          colors: initialData.colors || [],
          sizes: initialData.sizes || [],
          tags: initialData.tags || [],
          quantityPricing: {
            ranges: initialData.quantityPricing?.ranges || [],
          },
        });

        // Initialize selected values from initial data
        if (
          Array.isArray(initialData?.categories) &&
          initialData.categories.length > 0
        ) {
          form.setValue('categories', initialData.categories);
        }

        // Set subcategories if they exist
        if (
          Array.isArray(initialData?.subcategories) &&
          initialData.subcategories.length > 0
        ) {
          form.setValue('subcategories', initialData.subcategories);
        }
      } catch (error) {
        console.error('Error initializing form:', error);
      }
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
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
            name='categories'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel>Categories</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant='outline'
                        role='combobox'
                        className={cn(
                          'w-full justify-between',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value && field.value.length > 0
                          ? categories.find((cat) => cat._id === field.value[0])
                              ?.name || 'Select categories'
                          : 'Select categories'}
                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-full p-0'>
                    <Command>
                      <CommandInput placeholder='Search categories...' />
                      <CommandEmpty>No category found.</CommandEmpty>
                      <CommandGroup>
                        {categories.map((category) => (
                          <CommandItem
                            key={category._id}
                            value={category._id}
                            onSelect={() => {
                              field.onChange([category._id]);
                              // Clear subcategories when category changes
                              form.setValue('subcategories', []);
                            }}
                          >
                            {category.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Add back the subcategories FormField */}
          {availableSubcategories.length > 0 && (
            <FormField
              control={form.control}
              name='subcategories'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Subcategories</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          role='combobox'
                          className={cn(
                            'w-full justify-between',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value && field.value.length > 0
                            ? field.value
                                .map(
                                  (subId) =>
                                    availableSubcategories.find(
                                      (sub) => sub._id === subId
                                    )?.name
                                )
                                .filter(Boolean)
                                .join(', ')
                            : 'Select subcategories'}
                          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-full p-0'>
                      <Command>
                        <CommandInput placeholder='Search subcategories...' />
                        <CommandEmpty>No subcategory found.</CommandEmpty>
                        <CommandGroup>
                          {availableSubcategories.map((subcategory) => (
                            <CommandItem
                              key={subcategory._id}
                              value={subcategory._id}
                              onSelect={() => {
                                const currentValue = field.value || [];
                                const newValue = currentValue.includes(
                                  subcategory._id
                                )
                                  ? currentValue.filter(
                                      (id) => id !== subcategory._id
                                    )
                                  : [...currentValue, subcategory._id];
                                field.onChange(newValue);
                              }}
                            >
                              {subcategory.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
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
                    step='0.01'
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
                    step='0.01'
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
                      handleCurrencyChange({
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
                      handleCurrencyChange({
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
                  onChange={handleMediaChange}
                  onRemove={handleMediaRemove}
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
                  onChange={handleColorChange}
                  onRemove={handleColorRemove}
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
                  onChange={handleSizeChange}
                  onRemove={handleSizeRemove}
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
                  onChange={handleTagChange}
                  onRemove={handleTagRemove}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <FormLabel>Quantity Pricing (Optional)</FormLabel>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleAddRange}
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
                  onClick={() => handleRemoveRange(index)}
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
                  <FormLabel>Max Quantity (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min='1'
                      value={range.maxQuantity || ''}
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

        <div className='flex items-center justify-end space-x-4'>
          <Button
            type='button'
            variant='outline'
            onClick={() => router.push('/admin/products')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={loading}
          >
            {loading
              ? 'Saving...'
              : initialData?._id
                ? 'Update Product'
                : 'Create Product'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
