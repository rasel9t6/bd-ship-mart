import { NextRequest, NextResponse } from 'next/server';
import { getTrendingSearches } from '@/lib/actions/actions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8');

    const trending = await getTrendingSearches(limit);

    return NextResponse.json({ trending });
  } catch (error) {
    console.error('Trending searches API error:', error);
    return NextResponse.json(
      { error: 'Failed to get trending searches' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
