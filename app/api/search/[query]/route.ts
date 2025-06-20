import { connectToDB } from '@/lib/dbConnect';
import Product from '@/models/Product';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ query: string }> }
) => {
  console.log('Search API route called');

  try {
    await connectToDB();
    const { query } = await params;
    console.log('Searching for query:', query);

    const searchedProducts = await Product.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
      ],
    }).populate('categories', 'name');

    console.log(
      `Found ${searchedProducts.length} products for query: ${query}`
    );
    return NextResponse.json(searchedProducts, { status: 200 });
  } catch (err) {
    console.error('Search API error:', err);
    return NextResponse.json(
      {
        error: 'Failed to perform search',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};

export const dynamic = 'force-dynamic';
