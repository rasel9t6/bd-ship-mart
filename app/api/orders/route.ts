import { NextRequest, NextResponse } from 'next/server';

import { connectToDB } from '@/lib/dbConnect';
import Customer from '@/models/Customer';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { OrderType } from '@/types/next-utils';

// Fetch all orders
export const GET = async () => {
  try {
    await connectToDB();

    const orders = await Order.find()
      .populate({
        path: 'products.product',
        model: Product,
      })
      .populate({
        path: 'customerId',
        model: Customer,
        select: 'name email phone address customerId',
      })
      .sort({ createdAt: -1 });

    return new NextResponse(JSON.stringify(orders), {
      status: 200,
    });
  } catch (error) {
    console.error('[orders_GET]', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
};

// Create a new order
export const POST = async (req: NextRequest) => {
  try {
    const orderData = await req.json();

    // Validate required fields
    if (
      !orderData.userId ||
      !orderData.products ||
      !orderData.shippingAddress
    ) {
      return new NextResponse(
        JSON.stringify({
          error: 'Missing required fields: userId, products, shippingAddress',
        }),
        { status: 400 }
      );
    }

    await connectToDB();

    // Create new order
    const newOrder = await Order.create({
      ...orderData,
      trackingHistory: [
        {
          status: 'pending',
          timestamp: new Date(),
          location: 'Order received',
        },
      ],
    });

    // Find the customer to update their orders array
    const customer = await Customer.findOne({ customerId: orderData.userId });

    if (customer) {
      // Add order to customer's orders array
      customer.orders.push(newOrder._id);
      await customer.save();
    } else {
      console.error(`Customer with ID ${orderData.userId} not found`);
    }

    const userOrders = await fetch(`${process.env.STORE_API_URL}/users`);
    const userOrdersData = await userOrders.json();
    const userOrder = userOrdersData.find(
      (order: OrderType) => order.customerId === orderData.userId
    );
    if (userOrder) {
      userOrder.orders.push(newOrder._id);
    }
    return new NextResponse(
      JSON.stringify({
        message: 'Order created successfully',
        order: newOrder,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error('[ORDER_CREATE_ERROR]', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
};
