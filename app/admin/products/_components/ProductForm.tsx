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
import { ProductType } from '@/types/next-utils';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// Define the form schema with Zod
const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
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
  media: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
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

interface Props {
  initialData?: ProductType & {
    category?: CategoryField;
  };
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

export default function ProductForm({ initialData }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category['subcategories']>(
    []
  );
  const [loading, setLoading] = useState(false);

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
      subcategory: '',
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
      tags: initialData?.tags || [],
      sizes: initialData?.sizes || [],
      colors: initialData?.colors || [],
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
      const res = await fetch(`/api/categories/${categoryId}`);
      const data: CategoryResponse = await res.json();
      setSubcategories(data.subcategories || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      toast.error('Failed to load subcategories');
    }
  };

  // Handle currency conversion
  const handleCurrencyChange = (values: FormValues) => {
    const { inputCurrency, price, currencyRates } = values;
    const { usdToBdt, cnyToBdt } = currencyRates;

    if (inputCurrency === 'CNY' && price.cny) {
      form.setValue('price.bdt', price.cny * cnyToBdt);
      form.setValue('price.usd', price.cny / 7); // Assuming 1 USD = 7 CNY
    } else if (inputCurrency === 'USD' && price.usd) {
      form.setValue('price.bdt', price.usd * usdToBdt);
      form.setValue('price.cny', price.usd * 7);
    }
  };

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      const url = initialData
        ? `/api/products/${initialData.slug}`
        : '/api/products';
      const method = initialData ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to save product');
      }

      toast.success(initialData ? 'Product updated' : 'Product created');
      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
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

          <FormField
            control={form.control}
            name='subcategory'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subcategory</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a subcategory' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subcategories.map((subcategory) => (
                      <SelectItem
                        key={subcategory._id}
                        value={subcategory._id}
                      >
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
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
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='Enter price'
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
