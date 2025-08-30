import React, { useState } from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Button } from '@/ui/button';
import { FormValues } from './types';
import SubcategoryForm from './SubcategoryForm';

interface SubcategoriesSectionProps {
  form: UseFormReturn<FormValues>;
  initialData?: any;
}

const SubcategoriesSection: React.FC<SubcategoriesSectionProps> = ({
  form,
  initialData,
}) => {
  const [isSubcategoryVisible, setIsSubcategoryVisible] = useState(
    initialData &&
      Array.isArray(initialData.subcategories) &&
      initialData.subcategories.length > 0
  );

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'subcategories',
  });

  const handleAddSubcategory = () => {
    setIsSubcategoryVisible(true);
    append({
      name: '',
      title: '',
      description: '',
      icon: '',
      thumbnail: '',
      isActive: true,
      sortOrder: fields.length,
      category: initialData?._id || '',
      shippingCharge: {
        byAir: { min: 0, max: 0 },
        bySea: { min: 0, max: 0 },
      },
    });
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold'>Subcategories</h2>
        <div className='flex gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => setIsSubcategoryVisible(!isSubcategoryVisible)}
          >
            {isSubcategoryVisible ? 'Hide' : 'Show'} Subcategories
          </Button>
          <Button
            type='button'
            variant='secondary'
            onClick={handleAddSubcategory}
          >
            Add Subcategory
          </Button>
        </div>
      </div>

      {isSubcategoryVisible &&
        fields.map((field, index) => (
          <SubcategoryForm
            key={field.id}
            form={form}
            index={index}
            onRemove={remove}
          />
        ))}
    </div>
  );
};

export default SubcategoriesSection;
