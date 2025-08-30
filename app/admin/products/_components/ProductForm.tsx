'use client';

import React from 'react';
import { MediaType } from '@/ui/custom/MediaUpload';
import { Form } from '@/ui/form';
import { useProductForm } from './useProductForm';
import ProductBasicInfo from './ProductBasicInfo';
import CategorySelection from './CategorySelection';
import CurrencyRates from './CurrencyRates';
import PricingSection from './PricingSection';
import ProductDetails from './ProductDetails';
import QuantityPricing from './QuantityPricing';
import FormActions from './FormActions';
import { Props } from './types';

export default function ProductForm({ initialData }: Props) {
  const {
    form,
    categories,
    availableSubcategories,
    loading,
    handleCurrencyChange,
    onSubmit,
    onError,
  } = useProductForm({ initialData });

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

  // Create a key for CategorySelection to force re-render when form is initialized
  const categorySelectionKey = initialData?._id
    ? `edit-${initialData._id}`
    : 'new';

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className='space-y-8'
      >
        <ProductBasicInfo form={form} />

        <CategorySelection
          key={categorySelectionKey}
          form={form}
          categories={categories}
          availableSubcategories={availableSubcategories}
        />

        <CurrencyRates
          form={form}
          onCurrencyChange={handleCurrencyChange}
        />

        <PricingSection
          form={form}
          onCurrencyChange={handleCurrencyChange}
        />

        <ProductDetails
          form={form}
          onMediaChange={handleMediaChange}
          onMediaRemove={handleMediaRemove}
          onColorChange={handleColorChange}
          onColorRemove={handleColorRemove}
          onSizeChange={handleSizeChange}
          onSizeRemove={handleSizeRemove}
          onTagChange={handleTagChange}
          onTagRemove={handleTagRemove}
        />

        <QuantityPricing
          form={form}
          onAddRange={handleAddRange}
          onRemoveRange={handleRemoveRange}
          onRangeChange={handleRangeChange}
        />

        <FormActions
          loading={loading}
          isEdit={!!initialData?._id}
        />
      </form>
    </Form>
  );
}
