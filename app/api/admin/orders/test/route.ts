// app/api/admin/orders/test/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Order from '@/models/Order';
import { authOptions } from '@/lib/authOption';
import { connectToDB } from '@/lib/dbConnect';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Test endpoint - Session user:', session?.user);

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectToDB();

    // Test 1: Count all orders
    const totalOrders = await Order.countDocuments();
    console.log('Total orders in database:', totalOrders);

    // Test 2: Find first few orders
    const sampleOrders = await Order.find()
      .limit(3)
      .select('orderId _id customerInfo');
    console.log('Sample orders:', sampleOrders);

    // Test 3: Try to find a specific order by orderId
    if (sampleOrders.length > 0) {
      const firstOrderId = sampleOrders[0].orderId;
      console.log('Testing lookup for orderId:', firstOrderId);

      const foundOrder = await Order.findOne({ orderId: firstOrderId });
      console.log('Found order by orderId:', foundOrder ? 'Yes' : 'No');

      if (foundOrder) {
        console.log('Order details:', {
          _id: foundOrder._id,
          orderId: foundOrder.orderId,
          customerInfo: foundOrder.customerInfo,
          status: foundOrder.status,
        });
      }
    }

    return NextResponse.json({
      message: 'Test completed',
      totalOrders,
      sampleOrders: sampleOrders.map((o) => ({
        orderId: o.orderId,
        _id: o._id,
        customerInfo: o.customerInfo,
      })),
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json(
      { message: 'Test failed', error: error.message },
      { status: 500 }
    );
  }
}
