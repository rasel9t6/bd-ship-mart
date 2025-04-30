import React from 'react';
import CategoryHero from '../_components/CategoryHero';
import CategorySlider from '../_components/CategorySlider';
import ProductCard from '../../products/_components/ProductCard';
import { ProductType } from '@/types/next-utils';
import { getCategory } from '@/lib/actions/actions';

// Define params with categoryId as string array
type Params = Promise<{
  categoryId: string[];
}>;

export default async function CategoryDetailsPage({
  params,
}: {
  params: Params;
}) {
  const { categoryId } = await params;

  const categoryPath = Array.isArray(categoryId)
    ? categoryId.join('/')
    : categoryId;

  // Fetch category data based on the full path
  const categoryDetails = await getCategory(categoryPath);

  const { title, description, thumbnail, products, name, subcategories } =
    categoryDetails;

  // Determine if this is a subcategory page
  const currentCategoryId = categoryId[categoryId.length - 1];

  return (
    <div className='px-2 pt-20 sm:px-5 sm:pt-28'>
      <CategoryHero
        title={title}
        description={description}
        thumbnail={thumbnail}
        products={products}
      />
      <div className='mx-auto max-w-7xl px-2 sm:px-4'>
        {/* Show CategorySlider if we have subcategories */}
        {subcategories?.length > 0 && (
          <CategorySlider
            items={subcategories}
            parentCategoryId={categoryPath}
            currentCategoryId={currentCategoryId}
          />
        )}
        <div className='container mx-auto px-4 py-10'>
          <div className='flex w-full flex-col items-center'>
            <h2 className='mb-8 text-heading3-bold text-gray-900'>
              {name} Collection
            </h2>
            <div className='flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8'>
              {products && products.length > 0 ? (
                products.map((product: ProductType, index: number) => (
                  <div
                    key={index}
                    className='min-w-[200px] max-w-[250px] flex-1'
                  >
                    <ProductCard product={product} />
                  </div>
                ))
              ) : (
                <p className='text-gray-500'>
                  No products found in this category
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
