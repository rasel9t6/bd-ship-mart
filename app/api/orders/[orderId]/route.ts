import { connectToDB } from '@/lib/dbConnect';
import Order from '@/models/Order';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    await connectToDB();

    const { orderId } = params;
    const { status, location } = await req.json();

    if (!status) {
      return new NextResponse(JSON.stringify({ error: 'Status is required' }), {
        status: 400,
      });
    }

    // Find order by either _id or custom orderId field
    const order = await Order.findOne({ orderId }); // Change to { orderId } if it's a custom field

    if (!order) {
      return new NextResponse(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
      });
    }

    // Update status & tracking history
    order.status = status;
    order.trackingHistory.push({
      status,
      timestamp: new Date(),
      location: location || 'Status updated',
    });

    await order.save();

    return new NextResponse(
      JSON.stringify({ message: 'Order status updated successfully', order }),
      { status: 200 }
    );
  } catch (error) {
    console.error('[ORDER_STATUS_UPDATE_ERROR]', error);

    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
