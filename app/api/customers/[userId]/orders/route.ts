import { connectToDB } from '@/lib/dbConnect';
import { NextRequest, NextResponse } from 'next/server';

import Order from '@/models/Order';
import Customer from '@/models/Customer';
type Params = Promise<{ userId: string }>;
export const GET = async (
  _req: NextRequest,
  { params }: { params: Params }
) => {
  try {
    await connectToDB();
    const { userId } = await params;

    // Find all orders for this customer
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    // Create response
    const response = NextResponse.json(orders, { status: 200 });

    return response;
  } catch (error) {
    console.error('[customer_orders_GET]', error);

    const response = NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );

    // Apply CORS headers to error response

    return response;
  }
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) => {
  try {
    await connectToDB();
    const { userId } = await params;
    const updateData = await req.json(); // Get updated data from request

    // Update Customer details
    if (updateData.name || updateData.phone || updateData.address) {
      await Customer.findOneAndUpdate(
        { userId }, // Ensure you have a unique user identifier
        {
          ...(updateData.name && { name: updateData.name }),
          ...(updateData.phone && { phone: updateData.phone }),
          ...(updateData.address && { address: updateData.address }),
          ...(updateData.orders && { orders: updateData.orders }),
        },
        { new: true }
      );
    }

    // Optionally, you can also update orders if needed
    // For example, if you want to consolidate updates,
    // add logic here to handle orders if updateData contains orders info

    // Create a response confirming the update
    const response = NextResponse.json(
      { message: 'Customer information updated successfully' },
      { status: 200 }
    );

    return response;
  } catch (error) {
    console.error('[customer_update_PATCH]', error);

    const response = NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );

    return response;
  }
};
