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
        { category: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }, // $in is used to match an array of values
      ],
    });

    return NextResponse.json(searchedProducts, { status: 200 });
  } catch (err) {
    console.log('[search_GET]', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const dynamic = 'force-dynamic';
