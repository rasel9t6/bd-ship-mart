import { connectToDB } from '@/lib/dbConnect';
import Product from '@/models/Product';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ query: string }> }
) => {
  try {
    await connectToDB();
    const { query } = await params;

    const searchedProducts = await Product.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
      ],
    }).populate('categories', 'name');

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
