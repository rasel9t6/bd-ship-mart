import { NextRequest, NextResponse } from 'next/server';
import {
  getSearchSuggestions,
  getPopularSearches,
} from '@/lib/actions/actions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type');

    // Handle popular searches request
    if (type === 'popular') {
      const limit = parseInt(searchParams.get('limit') || '10');
      const suggestions = await getPopularSearches(limit);
      return NextResponse.json({ suggestions });
    }

    // Handle regular search suggestions
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions = await getSearchSuggestions(query.trim());
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to get search suggestions' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
