import { NextRequest, NextResponse } from 'next/server';
import { advancedSearch, SearchFilters } from '@/lib/actions/actions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sortBy = (searchParams.get('sort') || 'relevance') as
      | 'relevance'
      | 'price_low'
      | 'price_high'
      | 'newest'
      | 'popular';
    const category = searchParams.get('category') || '';
    const subcategory = searchParams.get('subcategory') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';

    if (!query.trim()) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const filters: SearchFilters = {
      page,
      limit,
      sortBy,
      categories: category ? [category] : undefined,
      subcategories: subcategory ? [subcategory] : undefined,
      priceRange:
        minPrice && maxPrice
          ? {
              min: parseFloat(minPrice),
              max: parseFloat(maxPrice),
            }
          : undefined,
    };

    const startTime = Date.now();
    const results = await advancedSearch(query, filters);
    const searchTime = Date.now() - startTime;

    return NextResponse.json({
      ...results,
      searchTime,
      query,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
