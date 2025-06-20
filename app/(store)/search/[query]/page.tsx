import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getPopularSearches, getTrendingSearches } from '@/lib/actions/actions';
import SearchResults from './_components/SearchResults';
import SearchSidebar from './_components/SearchSidebar';
import { generateSearchMetadata, generateSearchBreadcrumbs } from '@/lib/seo';
import Breadcrumb from '@/ui/custom/Breadcrumb';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';

interface SearchPageProps {
  params: Promise<{ query: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Generate metadata for the search page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ query: string }>;
}) {
  const { query } = await params;
  const decodedQuery = decodeURIComponent(query);

  if (!decodedQuery.trim()) {
    return {
      title: 'Search',
      description: 'Search our collection of shipping and logistics products.',
    };
  }

  return generateSearchMetadata(decodedQuery, 0); // We'll update this with actual count later
}

export default async function SearchPage({
  params,
  searchParams,
}: SearchPageProps) {
  const { query } = await params;
  const decodedQuery = decodeURIComponent(query);
  const resolvedSearchParams = await searchParams;

  if (!decodedQuery.trim()) {
    notFound();
  }

  // Fetch popular and trending searches for sidebar
  const [popularSearches, trendingSearches] = await Promise.all([
    getPopularSearches(8),
    getTrendingSearches(6),
  ]);

  const breadcrumbs = generateSearchBreadcrumbs(decodedQuery);

  return (
    <>
      {/* Structured Data for Breadcrumbs */}
      <BreadcrumbJsonLd items={breadcrumbs} />

      <div className='min-h-screen bg-gray-50'>
        <div className='container mx-auto px-4 py-6'>
          {/* Breadcrumbs */}
          <div className='mb-4'>
            <Breadcrumb items={breadcrumbs} />
          </div>

          <div className='flex flex-col lg:flex-row gap-6 mt-6'>
            {/* Sidebar */}
            <div className='lg:w-1/4'>
              <SearchSidebar
                query={decodedQuery}
                searchParams={resolvedSearchParams}
                popularSearches={popularSearches}
                trendingSearches={trendingSearches}
              />
            </div>

            {/* Main Content */}
            <div className='lg:w-3/4'>
              <Suspense fallback={<div>Loading search results...</div>}>
                <SearchResults
                  query={decodedQuery}
                  searchParams={resolvedSearchParams}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const dynamic = 'force-dynamic';
