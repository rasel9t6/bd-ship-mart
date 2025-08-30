import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import slugify from 'slugify';
import { formSchema, FormValues, Category, Subcategory, Props } from './types';

export const useProductForm = ({ initialData }: Props) => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableSubcategories, setAvailableSubcategories] = useState<
    Subcategory[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [isFormInitialized, setIsFormInitialized] = useState(false);

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
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load categories');
      }
    };
    fetchData();
  }, []);

  // Initialize form with initial data after categories are loaded
  useEffect(() => {
    if (initialData && categories.length > 0 && !isFormInitialized) {
      try {
        console.log('Initializing form with:', { initialData, categories });

        // Find the selected categories and subcategories
        // Extract just the IDs from the category objects
        const selectedCategories =
          initialData.categories?.map((cat) => cat._id) || [];
        const selectedSubcategories =
          initialData.subcategories?.map((sub) => sub._id) || [];

        console.log('Selected categories:', selectedCategories);
        console.log('Selected subcategories:', selectedSubcategories);

        // Get the available subcategories for the selected category
        if (selectedCategories.length > 0) {
          const selectedCategory = categories.find(
            (cat) => cat._id === selectedCategories[0]
          );
          console.log('Found selected category:', selectedCategory);

          if (selectedCategory?.subcategories) {
            setAvailableSubcategories(selectedCategory.subcategories);
            console.log(
              'Set available subcategories:',
              selectedCategory.subcategories
            );
          }
        }

        // Use form.reset with all the data
        const formData = {
          title: initialData.title || '',
          description: initialData.description || '',
          sku: initialData.sku || '',
          categories: selectedCategories,
          subcategories: selectedSubcategories,
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
        };

        console.log('Resetting form with data:', formData);
        form.reset(formData);

        // Force trigger form field updates
        setTimeout(() => {
          form.trigger(['categories', 'subcategories']);
          console.log('Form values after reset and trigger:', form.getValues());
        }, 100);

        setIsFormInitialized(true);
      } catch (error) {
        console.error('Error initializing form:', error);
      }
    }
  }, [initialData, categories, form, isFormInitialized]);

  const selectedCategories = form.watch('categories');

  useEffect(() => {
    const selectedCategoryId = selectedCategories?.[0];
    if (selectedCategoryId) {
      const selectedCategory = categories.find(
        (cat) => cat._id === selectedCategoryId
      );
      if (selectedCategory?.subcategories) {
        setAvailableSubcategories(selectedCategory.subcategories);
        // Clear subcategories when category changes (but not during initial load)
        if (
          !initialData ||
          !initialData.categories?.some((cat) => cat._id === selectedCategoryId)
        ) {
          form.setValue('subcategories', []);
        }
      } else {
        setAvailableSubcategories([]);
      }
    } else {
      setAvailableSubcategories([]);
    }
  }, [selectedCategories, categories, form, initialData]);

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
        form.setValue('price.usd', 0);
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

  return {
    form,
    categories,
    availableSubcategories,
    loading,
    handleCurrencyChange,
    onSubmit,
    onError,
  };
};
