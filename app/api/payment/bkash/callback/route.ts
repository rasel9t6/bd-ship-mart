import { NextResponse } from 'next/server';
import Order from '@/models/Order';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Verify the payment status with bKash
    const verifyResponse = await fetch(
      `${process.env.BKASH_BASE_URL}/execute`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: process.env.BKASH_APP_SECRET || '',
          'X-APP-Key': process.env.BKASH_APP_KEY || '',
        },
        body: JSON.stringify({
          paymentID: data.paymentID,
        }),
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok) {
      throw new Error(verifyData.message || 'Failed to verify payment');
    }

    // Find the order using the paymentID
    const order = await Order.findOne({
      'paymentDetails.transactions.transactionId': data.paymentID,
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Update order status based on payment status
    const paymentStatus = verifyData.statusCode === '0000' ? 'paid' : 'failed';

    await Order.findByIdAndUpdate(
      order._id,
      {
        $set: {
          'paymentDetails.status': paymentStatus,
          'paymentDetails.transactions.$[elem].notes': `Payment ${paymentStatus}`,
        },
      },
      {
        arrayFilters: [{ 'elem.transactionId': data.paymentID }],
      }
    );

    // Redirect to success or failure page
    const redirectUrl =
      paymentStatus === 'paid'
        ? `${process.env.NEXT_PUBLIC_APP_URL}/payment_success`
        : `${process.env.NEXT_PUBLIC_APP_URL}/payment_failed`;

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('bKash callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/payment_failed`
    );
  }
}
