'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { ProductFormValues, productFormSchema } from '@/lib/type';
import slugify from 'slugify';
import { ProductType, CategoryType } from '../types/next-utils';

interface UseProductFormProps {
  initialData?: ProductType;
  collections: CategoryType[];
}

interface ProductFormData {
  title: string;
  description: string;
  media: string[];
  category: {
    name: string;
    subcategories: { name: string }[];
  };
  subcategories: string[];
  tags: string[];
  sizes: string[];
  colors: string[];
  inputCurrency: 'CNY' | 'USD';
  minimumOrderQuantity: number;
  price: {
    bdt: number;
    usd: number;
    cny: number;
  };
  quantityPricing: {
    ranges: Array<{
      minQuantity: number;
      maxQuantity?: number;
      price: {
        cny: number;
        usd: number;
        bdt: number;
      };
    }>;
  };
}

const getDefaultValues = (initialData?: ProductType): ProductFormValues => ({
  sku: initialData?.sku || '',
  title: initialData?.title || '',
  slug: initialData?.slug || '',
  description: initialData?.description || '',
  media: Array.isArray(initialData?.media)
    ? initialData.media.map((item) =>
        typeof item === 'string' ? item : item.url
      )
    : [],
  category: {
    name: initialData?.category?.name || '',
    subcategories: Array.isArray(initialData?.category?.subcategories)
      ? initialData.category.subcategories.map((sub) => ({
          name: typeof sub === 'string' ? sub : sub.name,
        }))
      : [],
  },
  tags: Array.isArray(initialData?.tags) ? initialData.tags : [],
  sizes: Array.isArray(initialData?.sizes) ? initialData.sizes : [],
  colors: Array.isArray(initialData?.colors)
    ? initialData.colors.map((item) =>
        typeof item === 'string' ? item : item.url
      )
    : [],
  inputCurrency: initialData?.inputCurrency === 'USD' ? 'USD' : 'CNY',
  minimumOrderQuantity: initialData?.minimumOrderQuantity || 1,
  quantityPricing: {
    ranges: Array.isArray(initialData?.quantityPricing?.ranges)
      ? initialData.quantityPricing.ranges.map((range) => ({
          minQuantity: range.minQuantity || 0,
          maxQuantity: range.maxQuantity || undefined,
          price: {
            cny: range.price?.cny || 0,
            usd: range.price?.usd || 0,
            bdt: range.price?.bdt || 0,
          },
        }))
      : [],
  },
  price: {
    cny: initialData?.price?.cny ?? 0,
    usd: initialData?.price?.usd ?? 0,
    bdt: initialData?.price?.bdt ?? 0,
  },
  expense: {
    cny: initialData?.expense?.cny ?? 0,
    usd: initialData?.expense?.usd ?? 0,
    bdt: initialData?.expense?.bdt ?? 0,
  },
  currencyRates: {
    usdToBdt: initialData?.currencyRates?.usdToBdt ?? 121.5,
    cnyToBdt: initialData?.currencyRates?.cnyToBdt ?? 17.5,
  },
});

export const useProductForm = ({
  initialData,
  collections,
}: UseProductFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCollections] = useState<CategoryType[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: getDefaultValues(initialData),
  });

  const { watch, setValue } = form;
  const title = watch('title');

  useEffect(() => {
    if (!initialData) {
      setValue('slug', slugify(title, { lower: true, strict: true }));
    }
  }, [title, setValue, initialData]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCollections(data);
      } catch (err) {
        console.error('[collections_GET]', err);
        toast.error('Failed to load collections');
      }
    };

    // Fetch categories only if they haven't been loaded yet
    if (categories.length === 0) {
      fetchCollections();
    }
  }, [categories.length]);

  const onSubmit = async (values: ProductFormValues) => {
    try {
      setLoading(true);
      const cleanedValues = JSON.parse(
        JSON.stringify(values, (key, value) =>
          value === undefined ? null : value
        )
      );

      const url = initialData
        ? `/api/products/${initialData._id}`
        : '/api/products';
      const method = initialData ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedValues),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || data.message || 'Failed to save product');
      }

      toast.success(
        `Product ${initialData ? 'updated' : 'created'} successfully`
      );
      router.push('/products');
      router.refresh();
    } catch (err) {
      console.error('[PRODUCT_SUBMIT]', err);
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState<ProductFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    media: Array.isArray(initialData?.media)
      ? initialData.media.map((item) =>
          typeof item === 'string' ? item : item.url
        )
      : [],
    category: initialData?.category || {
      name: '',
      subcategories: [],
    },
    subcategories: Array.isArray(initialData?.subcategories)
      ? initialData.subcategories.map((sub) =>
          typeof sub === 'string' ? sub : ''
        )
      : [],
    tags: Array.isArray(initialData?.tags) ? initialData.tags : [],
    sizes: Array.isArray(initialData?.sizes) ? initialData.sizes : [],
    colors: Array.isArray(initialData?.colors)
      ? initialData.colors.map((item) =>
          typeof item === 'string' ? item : item.url
        )
      : [],
    inputCurrency: initialData?.inputCurrency === 'USD' ? 'USD' : 'CNY',
    minimumOrderQuantity: initialData?.minimumOrderQuantity || 1,
    price: {
      bdt: initialData?.price?.bdt ?? 0,
      usd: initialData?.price?.usd ?? 0,
      cny: initialData?.price?.cny ?? 0,
    },
    quantityPricing: {
      ranges: Array.isArray(initialData?.quantityPricing?.ranges)
        ? initialData.quantityPricing.ranges.map((range) => ({
            minQuantity: range.minQuantity || 0,
            maxQuantity: range.maxQuantity || undefined,
            price: {
              cny: range.price?.cny || 0,
              usd: range.price?.usd || 0,
              bdt: range.price?.bdt || 0,
            },
          }))
        : [],
    },
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePriceChange = (currency: 'bdt' | 'usd', value: number) => {
    setFormData((prev) => ({
      ...prev,
      price: {
        ...prev.price,
        [currency]: value,
      },
    }));
  };

  const handleArrayChange = (field: keyof ProductFormData, value: string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleQuantityPricingChange = (
    ranges: Array<{
      minQuantity: number;
      maxQuantity?: number;
      price: {
        cny: number;
        usd: number;
        bdt: number;
      };
    }>
  ) => {
    setFormData((prev) => ({
      ...prev,
      quantityPricing: {
        ranges: ranges.map((range) => ({
          minQuantity: range.minQuantity,
          maxQuantity: range.maxQuantity,
          price: {
            cny: range.price.cny || 0,
            usd: range.price.usd || 0,
            bdt: range.price.bdt || 0,
          },
        })),
      },
    }));
  };

  const handleAddRange = () => {
    setFormData((prev) => ({
      ...prev,
      quantityPricing: {
        ranges: [
          ...prev.quantityPricing.ranges,
          {
            minQuantity: 0,
            maxQuantity: undefined,
            price: {
              cny: 0,
              usd: 0,
              bdt: 0,
            },
          },
        ],
      },
    }));
  };

  // Use collections for validation or other purposes
  useEffect(() => {
    if (collections.length > 0) {
      // Validate category against available collections
      const isValidCategory = collections.some(
        (collection) => collection._id.toString() === formData.category.name
      );
      if (!isValidCategory && formData.category.name) {
        console.warn('Selected category is not in available collections');
      }
    }
  }, [collections, formData.category.name]);

  return {
    form,
    loading,
    categories,
    onSubmit,
    handleKeyPress: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') e.preventDefault();
    },
    formData,
    handleChange,
    handlePriceChange,
    handleArrayChange,
    handleQuantityPricingChange,
    handleAddRange,
  };
};
