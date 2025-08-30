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

    // First, validate that the user has complete information
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has complete profile information
    const missingFields = [];
    if (!user.name) missingFields.push('name');
    if (!user.email) missingFields.push('email');
    if (!user.phone) missingFields.push('phone');
    if (!user.address?.street) missingFields.push('street address');
    if (!user.address?.city) missingFields.push('city');
    if (!user.address?.state) missingFields.push('state/district');
    if (!user.address?.zipCode) missingFields.push('postal code');
    if (!user.address?.country) missingFields.push('country');

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Incomplete profile information',
          missingFields,
          message: `Please complete your profile with the following information: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

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

    // Validate shipping address
    if (!orderData.shippingAddress) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    const requiredAddressFields = [
      'street',
      'city',
      'state',
      'postalCode',
      'country',
    ];
    const missingAddressFields = requiredAddressFields.filter(
      (field) => !orderData.shippingAddress[field]
    );

    if (missingAddressFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Incomplete shipping address',
          missingFields: missingAddressFields,
          message: `Please provide complete shipping address: ${missingAddressFields.join(', ')}`,
        },
        { status: 400 }
      );
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
      trackingHistory: [
        {
          status: 'Order Placed',
          timestamp: new Date(),
          location: 'Order System',
          notes:
            'Your order has been successfully placed. Our representative will contact you soon.',
        },
      ],
    });
    const savedOrder = await order.save();

    // Update user with order and address information
    await User.findByIdAndUpdate(session.user.id, {
      $addToSet: { orders: savedOrder._id },
      $set: {
        address: {
          street: orderData.shippingAddress.street,
          city: orderData.shippingAddress.city,
          state: orderData.shippingAddress.state,
          zipCode: orderData.shippingAddress.postalCode,
          country: orderData.shippingAddress.country,
        },
        phone: orderData.phone || user.phone, // Update phone if provided in order
      },
    });

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
