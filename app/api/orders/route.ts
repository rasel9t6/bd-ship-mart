import { authOptions } from '@/lib/authOption';
import { connectToDB } from '@/lib/dbConnect';
import Order from '@/models/Order';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    const orderData = await request.json();

    // Validate product IDs
    if (!orderData.products || !Array.isArray(orderData.products)) {
      return NextResponse.json(
        { error: 'Products array is required' },
        { status: 400 }
      );
    }

    // Validate each product ID
    for (const product of orderData.products) {
      if (!mongoose.Types.ObjectId.isValid(product.product)) {
        return NextResponse.json(
          { error: `Invalid product ID: ${product.product}` },
          { status: 400 }
        );
      }
    }

    // Create new order
    const order = new Order({
      ...orderData,
      customerInfo: session.user.id,
      status: 'pending',
      paymentDetails: {
        status: 'pending',
        transactions: [],
      },
    });
    const savedOrder = await order.save();

    // Update user if needed
    if (orderData.customerInfo) {
      const userId = orderData.customerInfo;

      // Add order to user's orders array
      await User.findByIdAndUpdate(userId, {
        $addToSet: { orders: savedOrder._id },
      });
    }

    return NextResponse.json(savedOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// GET /api/orders - Get orders with optional filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');
    const sort = searchParams.get('sort') || '-createdAt';

    const query = userId ? { customerInfo: userId } : {};

    const orders = await Order.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('customerInfo', 'name email phone')
      .populate('products.product', 'name images price');

    const total = await Order.countDocuments(query);

    return NextResponse.json({
      orders,
      total,
      hasMore: total > skip + orders.length,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
