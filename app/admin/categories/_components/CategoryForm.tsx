'use client';
import React from 'react';
import Link from 'next/link';
import { Form } from '@/ui/form';
import { Button } from '@/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/ui/card';
import { Separator } from '@radix-ui/react-dropdown-menu';
import Delete from '@/ui/custom/Delete';
import { CategoryFormProps } from './types';
import { useCategoryForm } from './useCategoryForm';
import CategoryBasicInfo from './CategoryBasicInfo';
import ShippingChargeSection from './ShippingChargeSection';
import MediaUploadSection from './MediaUploadSection';
import CategorySettings from './CategorySettings';
import SubcategoriesSection from './SubcategoriesSection';

const CategoryForm = ({ initialData }: CategoryFormProps) => {
  const { form, isSubmitting, handleFormSubmit } = useCategoryForm({
    initialData,
  });

  return (
    <Card className='bg-white shadow-sm'>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>
          {initialData ? 'Edit Category' : 'Create Category'}
        </CardTitle>
        {initialData && (
          <Delete
            id={initialData.slug}
            item='category'
          />
        )}
      </CardHeader>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <CardContent className='space-y-6 pt-6'>
            {/* Main Category Fields */}
            <CategoryBasicInfo form={form} />

            {/* Shipping Charge Section */}
            <ShippingChargeSection form={form} />

            {/* Media Upload Section */}
            <MediaUploadSection form={form} />

            {/* Category Settings */}
            <CategorySettings form={form} />

            {/* Subcategories Section */}
            <SubcategoriesSection
              form={form}
              initialData={initialData}
            />
          </CardContent>

          <CardFooter className='flex items-center gap-4 pt-4'>
            <Button
              type='submit'
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Saving...'
                : `Save ${initialData ? 'Changes' : 'Category'}`}
            </Button>
            <Link href='/admin/categories'>
              <Button
                type='button'
                variant='outline'
              >
                Cancel
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default CategoryForm;
