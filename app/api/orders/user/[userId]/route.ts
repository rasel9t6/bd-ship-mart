import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Order from '@/models/Order';
import { authOptions } from '@/lib/authOption';
import { connectToDB } from '@/lib/dbConnect';
type Params = Promise<{ userId: string }>;
export async function GET(_request: Request, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);
    const { userId } = await params;
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is accessing their own orders
    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectToDB();

    // Find all orders for the user
    const orders = await Order.find({ customerId: userId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .populate('products.product')
      .lean();

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
