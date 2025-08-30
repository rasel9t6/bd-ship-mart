// app/api/admin/orders/[orderId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import Order from '@/models/Order';
import Product from '@/models/Product';
import { authOptions } from '@/lib/authOption';
import { connectToDB } from '@/lib/dbConnect';

type Params = Promise<{ orderId: string }>;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  try {
    console.log('=== Starting GET request for order:', orderId);

    const session = await getServerSession(authOptions);
    console.log('Session user:', session?.user);

    if (!session?.user) {
      console.log('No session found');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      console.log('User role:', session.user.role, 'Access denied');
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    console.log('User is admin, connecting to DB...');
    await connectToDB();
    console.log('DB connected, searching for order with orderId:', orderId);

    // Test if Order model is working
    try {
      const orderCount = await Order.countDocuments();
      console.log('Total orders in database:', orderCount);
    } catch (countError) {
      console.error('Error counting orders:', countError);
      return NextResponse.json(
        { message: 'Database error - cannot access orders' },
        { status: 500 }
      );
    }

    // Try to find order by orderId first
    console.log('Searching by orderId:', orderId);
    let order = await Order.findOne({ orderId }).populate(
      'customerInfo',
      'name email phone'
    );

    console.log('Order found by orderId:', !!order);

    // If not found by orderId, try by _id (in case the orderId is actually an _id)
    if (!order) {
      console.log('Order not found by orderId, trying by _id...');
      try {
        order = await Order.findById(orderId).populate(
          'customerInfo',
          'name email phone'
        );
        console.log('Order found by _id:', !!order);
      } catch (findByIdError) {
        console.error('Error finding order by _id:', findByIdError);
      }
    }

    // Try to populate products separately to avoid any issues
    if (order && order.products && order.products.length > 0) {
      console.log(
        'Attempting to populate products for',
        order.products.length,
        'products'
      );

      // First, let's check what product IDs we have
      const productIds = order.products.map((p) => p.product).filter(Boolean);
      console.log('Product IDs to populate:', productIds);

      // Check if these products actually exist in the database
      if (productIds.length > 0) {
        try {
          const existingProducts = await Product.find({
            _id: { $in: productIds },
          }).select('_id title name sku');
          console.log('Found existing products:', existingProducts.length);
          console.log(
            'Existing product IDs:',
            existingProducts.map((p) => p._id.toString())
          );
        } catch (productCheckError) {
          console.error('Error checking existing products:', productCheckError);
        }
      }

      try {
        await Order.populate(order, {
          path: 'products.product',
          select: 'name title sku images',
        });
        console.log('Products populated successfully');

        // Check what we got after populate
        order.products.forEach((p, index) => {
          console.log(`Product ${index}:`, {
            hasProduct: !!p.product,
            productType: typeof p.product,
            productId: p.product?._id || 'No ID',
            productTitle: p.product?.title || 'No title',
          });
        });

        // Add fallback data for missing products
        order.products.forEach((p, index) => {
          if (!p.product || p.product === null) {
            // Create a fallback product object with the original ID
            const originalProductId = p.product || 'Unknown';
            p.product = {
              _id: originalProductId,
              title: `Product (Deleted - ID: ${originalProductId})`,
              name: `Product (Deleted - ID: ${originalProductId})`,
              sku: 'N/A',
              images: [],
            };
            console.log(`Added fallback data for product ${index}:`, p.product);
          }
        });
      } catch (populateError) {
        console.error('Error populating products:', populateError);
        // Continue without product population
      }
    }

    // Debug: Check if products are populated
    if (order && order.products) {
      console.log(
        'Products after populate:',
        order.products.map((p) => ({
          productType: typeof p.product,
          productKeys:
            p.product && typeof p.product === 'object' && p.product !== null
              ? Object.keys(p.product)
              : 'N/A',
          productData: p.product,
          hasProduct: !!p.product,
        }))
      );
    }

    console.log('Found order:', order ? 'Yes' : 'No');

    if (order) {
      console.log('Order structure:', {
        _id: order._id,
        orderId: order.orderId,
        customerInfo: order.customerInfo,
        hasCustomerInfo: !!order.customerInfo,
        customerInfoType: typeof order.customerInfo,
        customerInfoKeys: order.customerInfo
          ? Object.keys(order.customerInfo)
          : 'N/A',
      });
    }

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { message: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/orders/[orderId] - Update a specific order (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectToDB();

    const { orderId } = await params;
    const updateData = await request.json();

    // Get the current order to check if status is changing
    let currentOrder = await Order.findOne({ orderId });
    if (!currentOrder) {
      currentOrder = await Order.findById(orderId);
    }

    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if status is being updated and add tracking history
    if (updateData.status && updateData.status !== currentOrder.status) {
      const trackingEntry = generateTrackingEntry(updateData.status);

      // Add tracking history to update data
      updateData.trackingHistory = [
        ...(currentOrder.trackingHistory || []),
        trackingEntry,
      ];

      console.log(
        `Status changed from ${currentOrder.status} to ${updateData.status}`
      );
      console.log('Added tracking entry:', trackingEntry);
    }

    // Try to find and update order by orderId first
    let updatedOrder = await Order.findOneAndUpdate(
      { orderId },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('customerInfo', 'name email phone');

    // If not found by orderId, try by _id
    if (!updatedOrder) {
      console.log('Order not found by orderId for update, trying by _id...');
      updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('customerInfo', 'name email phone');
    }

    // Try to populate products separately
    if (
      updatedOrder &&
      updatedOrder.products &&
      updatedOrder.products.length > 0
    ) {
      try {
        await Order.populate(updatedOrder, {
          path: 'products.product',
          select: 'name title sku images',
        });
      } catch (populateError) {
        console.error('Error populating products in update:', populateError);
        // Continue without product population
      }
    }

    if (!updatedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// Helper function to generate tracking history entries
function generateTrackingEntry(status: string) {
  const timestamp = new Date();

  switch (status) {
    case 'pending':
      return {
        status: 'Order Placed',
        timestamp,
        location: 'Order System',
        notes:
          'Your order has been successfully placed. Our representative will contact you soon.',
      };
    case 'confirmed':
      return {
        status: 'Order Confirmed',
        timestamp,
        location: 'Order System',
        notes: 'Your order has been confirmed and is being processed.',
      };
    case 'processing':
      return {
        status: 'Processing',
        timestamp,
        location: 'Warehouse',
        notes: 'Your order is being prepared and is ready to ship.',
      };
    case 'shipped':
      return {
        status: 'Shipped',
        timestamp,
        location: 'China',
        notes: 'Your order has been shipped from China.',
      };
    case 'in-transit':
      return {
        status: 'In Transit',
        timestamp,
        location: 'International Shipping',
        notes: 'Your order is currently in transit.',
      };
    case 'out-for-delivery':
      return {
        status: 'Out for Delivery',
        timestamp,
        location: 'Local Delivery',
        notes: 'Your order is out for delivery.',
      };
    case 'delivered':
      return {
        status: 'Delivered',
        timestamp,
        location: 'Destination',
        notes: 'Successfully delivered to your address.',
      };
    case 'canceled':
      return {
        status: 'Order Canceled',
        timestamp,
        location: 'Order System',
        notes: 'Order has been canceled.',
      };
    case 'returned':
      return {
        status: 'Order Returned',
        timestamp,
        location: 'Return Center',
        notes: 'Order has been returned.',
      };
    default:
      return {
        status: `Status: ${status}`,
        timestamp,
        location: 'Order System',
        notes: `Order status updated to ${status}.`,
      };
  }
}
