import { Metadata } from 'next';
import { getCategories } from '@/lib/actions/actions';
import { generateBaseMetadata } from '@/lib/seo';
import CategoryCard from './_components/CategoryCard';
import CategoryFilters from './_components/CategoryFilters';
import CategorySort from './_components/CategorySort';
import Pagination from '@/ui/custom/Pagination';

export const metadata: Metadata = {
  ...generateBaseMetadata(),
  title: 'Categories - K2B EXPRESS',
  description:
    'Browse all product categories. Find shipping and logistics products organized by category for easy navigation.',
  keywords: [
    'categories',
    'product categories',
    'shipping categories',
    'logistics categories',
  ],
  openGraph: {
    ...generateBaseMetadata().openGraph,
    title: 'Categories - K2B EXPRESS',
    description:
      'Browse all product categories. Find shipping and logistics products organized by category.',
  },
};

interface CategoriesPageProps {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    search?: string;
    featured?: string;
  }>;
}

export default async function CategoriesPage({
  searchParams,
}: CategoriesPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const sort = params.sort || 'name';
  const search = params.search || '';
  const featured = params.featured === 'true';

  // Get categories with pagination and filtering
  const categories = await getCategories({
    page,
    limit: 12,
    sort,
    search,
    featured,
  });

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='text-center'>
            <h1 className='text-3xl font-bold text-gray-900 sm:text-4xl'>
              Product Categories
            </h1>
            <p className='mt-4 text-lg text-gray-600 max-w-2xl mx-auto'>
              Explore our comprehensive collection of shipping and logistics
              products organized by category
            </p>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Filters and Sort */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
          <CategoryFilters
            currentSearch={search}
            currentFeatured={featured}
          />
          <CategorySort currentSort={sort} />
        </div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {categories.map((category) => (
                <CategoryCard
                  key={category._id}
                  category={category}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className='mt-12'>
              <Pagination
                currentPage={page}
                totalPages={Math.ceil(categories.length / 12)}
                baseUrl='/categories'
                searchParams={params}
              />
            </div>
          </>
        ) : (
          <div className='text-center py-12'>
            <div className='mx-auto h-12 w-12 text-gray-400'>
              <svg
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                />
              </svg>
            </div>
            <h3 className='mt-2 text-sm font-medium text-gray-900'>
              No categories found
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
