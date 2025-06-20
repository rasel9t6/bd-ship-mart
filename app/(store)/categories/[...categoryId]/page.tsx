import React from 'react';
import CategoryHero from '../_components/CategoryHero';
import CategorySlider from '../_components/CategorySlider';
import ProductCard from '../../products/_components/ProductCard';
import { ProductType } from '@/types/next-utils';
import { getCategory } from '@/lib/actions/actions';
import {
  generateCategoryMetadata,
  generateCategoryBreadcrumbs,
} from '@/lib/seo';
import Breadcrumb from '@/ui/custom/Breadcrumb';
import CategoryJsonLd from '@/components/seo/CategoryJsonLd';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';

// Define params for the catch-all route [...categoryId]
type Params = Promise<{
  categoryId: string[];
}>;

// Generate metadata for the category page
export async function generateMetadata({ params }: { params: Params }) {
  const { categoryId } = await params;
  const category = await getCategory(categoryId);

  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found.',
    };
  }

  return generateCategoryMetadata(category);
}

export default async function CategoryDetailsPage({
  params,
}: {
  params: Params;
}) {
  const { categoryId } = await params;

  // Pass the categoryId array directly to getCategory
  // Our updated getCategory can handle both string paths and arrays
  const categoryDetails = await getCategory(categoryId);

  if (!categoryDetails) {
    return (
      <div className='px-2 pt-20 sm:px-5 sm:pt-28'>
        <div className='mx-auto max-w-7xl px-2 sm:px-4 py-10'>
          <h2 className='text-heading3-bold text-gray-900 mb-4'>
            Category Not Found
          </h2>
          <p className='text-gray-500'>
            Sorry, the category &ldquo;{categoryId.join('/')}&rdquo; does not
            exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const { title, description, thumbnail, products, name, subcategories } =
    categoryDetails;

  // Get the current category ID (last segment of the path)
  const currentCategoryId = categoryId[categoryId.length - 1];
  const breadcrumbs = generateCategoryBreadcrumbs(categoryId);

  return (
    <>
      {/* Structured Data */}
      <CategoryJsonLd category={categoryDetails} />
      <BreadcrumbJsonLd items={breadcrumbs} />

      <div className='px-2 pt-20 sm:px-5 sm:pt-28'>
        {/* Breadcrumbs */}
        <div className='mx-auto max-w-7xl px-2 sm:px-4 py-4'>
          <Breadcrumb items={breadcrumbs} />
        </div>

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
              parentCategoryId={categoryId.join('/')}
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
    </>
  );
}
