import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { formSchema, FormValues, CategoryFormProps } from './types';

export const useCategoryForm = ({ initialData }: CategoryFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Make sure subcategories is always an array
  const safeSubcategories =
    initialData && initialData.subcategories
      ? Array.isArray(initialData.subcategories)
        ? initialData.subcategories
        : []
      : [];

  // Format subcategories for the form
  const formattedSubcategories = safeSubcategories.map((sub) => ({
    ...sub,
    category: initialData?._id || '',
    shippingCharge: sub.shippingCharge || {
      byAir: { min: 0, max: 0 },
      bySea: { min: 0, max: 0 },
    },
  }));

  // Prepare default values for the form
  const defaultValues = initialData
    ? {
        ...initialData,
        shippingCharge: initialData.shippingCharge || {
          byAir: { min: 0, max: 0 },
          bySea: { min: 0, max: 0 },
        },
        subcategories: formattedSubcategories,
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
      };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onChange',
  });

  // If needed, fetch subcategories data from API
  useEffect(() => {
    // Only run if we have initialData but fields are empty
    if (
      initialData?._id &&
      form.getValues('subcategories').length === 0 &&
      formattedSubcategories.length > 0
    ) {
      // Use setValue instead of replace to avoid errors
      form.setValue('subcategories', formattedSubcategories);
    }
  }, [initialData, form, formattedSubcategories]);

  // Debug logging
  useEffect(() => {
    if (initialData) {
      console.log('Initial subcategories:', formattedSubcategories);
      console.log('Current fields:', form.getValues('subcategories'));
    }
  }, [initialData, form, formattedSubcategories]);

  const handleFormSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      // Format the data for the API
      const formattedData = {
        ...values,
        subcategories: values.subcategories.map((sub, index) => ({
          ...sub,
          sortOrder: index,
          category: initialData?._id || '', // Will be set by API for new categories
        })),
      };

      const url = initialData
        ? `/api/categories/${initialData.slug}`
        : '/api/categories';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      router.push('/admin/categories');
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to save category'
      );
      console.error('Category submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    handleFormSubmit,
  };
};
