import { connectToDB } from '@/lib/dbConnect';
import Category from '@/models/Category';
import Product from '@/models/Product';
import Subcategory from '@/models/Subcategory';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import toast from 'react-hot-toast';

const handleError = (message: string, status: number = 500): NextResponse => {
  console.error(message);
  return new NextResponse(message, { status });
};

// GET handler
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ productSlug: string }> }
) {
  try {
    await connectToDB();
    const { productSlug } = await params;
    const product = await Product.findOne({ slug: productSlug })
      .populate({
        path: 'category',
        model: Category,
        populate: {
          path: 'subcategories',
          model: Subcategory,
        },
      })
      .lean();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    revalidatePath(`/products/${productSlug}`);
    return NextResponse.json(product);
  } catch (error: unknown) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to fetch product',
      },
      { status: 500 }
    );
  }
}

// POST handler
export const POST = async (req: NextRequest) => {
  try {
    await connectToDB();
    const body = await req.json();

    // Validate required fields
    if (!body.title || !body.category) {
      return handleError('Title and category are required', 400);
    }

    // Create and save the new product
    const product = new Product(body);
    await product.validate();
    await product.save();

    toast.success(`Product Created: ${product._id}`);

    // Update the category's products array
    if (body.category) {
      await Category.findByIdAndUpdate(body.category, {
        $addToSet: { products: product._id },
      });
      toast.success(`Category Updated with Product: ${body.category}`);
    }

    return new NextResponse(JSON.stringify({ success: true, product }), {
      status: 201,
    });
  } catch (error) {
    toast.error(`Failed to create product | ${error}`);
    return handleError('Internal Server Error', 500);
  }
};

// PATCH handler
export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ productSlug: string }> }
) => {
  try {
    await connectToDB();
    const { productSlug } = await params;
    const body = await req.json();

    // Check if the product exists
    const existingProduct = await Product.findOne({ slug: productSlug });
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Prevent updating the slug
    delete body.slug;

    // Update product (excluding slug)
    const updatedProduct = await Product.findByIdAndUpdate(
      existingProduct._id,
      body,
      {
        new: true,
        runValidators: true,
        upsert: false,
      }
    );

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('❌ Error updating product:', error);
    return handleError('Internal Server Error', 500);
  }
};

// DELETE handler
export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ productSlug: string }> }
) => {
  try {
    await connectToDB();
    const { productSlug } = await params;

    const product = await Product.findOne({ slug: productSlug });
    if (!product) {
      return new NextResponse(
        JSON.stringify({ message: 'Product not found' }),
        { status: 404 }
      );
    }

    await Product.findByIdAndDelete(product._id);

    // Update category's products array
    if (product.category) {
      await Category.findByIdAndUpdate(product.category, {
        $pull: { products: product._id },
      });
    }

    revalidatePath('/admin/products');
    revalidatePath('/products');
    return new NextResponse(JSON.stringify({ message: 'Product deleted' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500 }
    );
  }
};

export const dynamic = 'force-dynamic';
