import { NextRequest, NextResponse } from 'next/server';

import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import { revalidatePath } from 'next/cache';
import { connectToDB } from '@/lib/dbConnect';

// Define the types for category and subcategory
interface SubcategoryType {
  name: string;
  title: string;
  description: string;
  icon: string;
  thumbnail: string;
  isActive: boolean;
  shippingCharge: number;
}

interface CategoryType {
  name: string;
  title: string;
  description: string;
  icon: string;
  thumbnail: string;
  isActive: boolean;
  sortOrder: number;
  shippingCharge: number;
  subcategories?: SubcategoryType[]; // optional for subcategories
}

export const POST = async (req: NextRequest) => {
  try {
    await connectToDB();

    const data: CategoryType = await req.json(); // Explicitly type the request data

    // Create the main category first
    const categoryData = {
      name: data.name,
      title: data.title,
      description: data.description,
      icon: data.icon,
      thumbnail: data.thumbnail,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
      shippingCharge: data.shippingCharge,
    };

    const category = await Category.create(categoryData);

    // Create subcategories if any
    if (data.subcategories && data.subcategories.length > 0) {
      const subcategoryPromises = data.subcategories.map(
        async (sub: SubcategoryType) => {
          const subcategoryData = {
            name: sub.name,
            title: sub.title,
            description: sub.description,
            icon: sub.icon,
            thumbnail: sub.thumbnail,
            isActive: sub.isActive,
            category: category._id,
            shippingCharge: sub.shippingCharge,
          };
          const subcategory = await Subcategory.create(subcategoryData);
          return subcategory._id;
        }
      );

      const subcategoryIds = await Promise.all(subcategoryPromises);
      category.subcategories = subcategoryIds;
      await category.save();
    }

    revalidatePath('/categories');
    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    console.log('[Category_POST]', error);
    if (error instanceof Error) {
      return new NextResponse(`Internal Server Error: ${error.message}`, {
        status: 500,
      });
    } else {
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  }
};

export const GET = async () => {
  try {
    await connectToDB();

    const categories = await Category.find()
      .populate({
        path: 'subcategories',
        model: Subcategory,
      })
      .sort({ sortOrder: 1 })
      .lean();

    return new NextResponse(JSON.stringify(categories), {
      status: 200,
    });
  } catch (error: unknown) {
    console.error('[Categories_GET]', error);
    if (error instanceof Error) {
      return new NextResponse(
        JSON.stringify({
          error: error.message || 'Failed to fetch categories',
        }),
        {
          status: 500,
        }
      );
    } else {
      return new NextResponse(
        JSON.stringify({ error: 'An unknown error occurred' }),
        {
          status: 500,
        }
      );
    }
  }
};

export const dynamic = 'force-dynamic';
