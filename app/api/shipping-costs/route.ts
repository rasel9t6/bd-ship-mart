import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';
import Category from '@/models/Category';

export async function GET() {
  try {
    await connectToDB();

    const categories = await Category.find({ isActive: true })
      .select('name title slug shippingCharge subcategories')
      .populate({
        path: 'subcategories',
        select: 'name title slug shippingCharge',
        match: { isActive: true },
      });

    // Transform the data to match the frontend structure
    const transformedData = categories.reduce((acc, category) => {
      acc[category.slug] = {
        name: category.name,
        cost: null,
        subcategories: category.subcategories.reduce((subAcc, subcategory) => {
          subAcc[subcategory.slug] = {
            name: subcategory.name,
            cost: {
              byAir: subcategory.shippingCharge?.byAir || { min: 0, max: 0 },
              bySea: subcategory.shippingCharge?.bySea || { min: 0, max: 0 },
            },
          };
          return subAcc;
        }, {}),
      };
      return acc;
    }, {});

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('[SHIPPING_COSTS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
