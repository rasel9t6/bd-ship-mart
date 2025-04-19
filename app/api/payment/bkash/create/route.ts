import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Order from "@/models/Order";
import { connectToDatabase } from "@/lib/db";
import { getBkashAuthToken } from "@/lib/bkash";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { amount, orderId, currency, bkashNumber } = await req.json();

    // Validate the order exists and belongs to the user
    const order = await Order.findOne({
      orderId,
      customerInfo: session.user.id,
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    await connectToDatabase();

    // Get bKash auth token
    const authToken = await getBkashAuthToken();

    // Initialize bKash payment
    const bkashResponse = await fetch(
      "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
          "X-APP-Key": process.env.BKASH_APP_KEY || "",
        },
        body: JSON.stringify({
          mode: "0011",
          payerReference: orderId,
          callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/bkash/callback`,
          amount: amount[currency.toLowerCase()],
          currency: currency,
          intent: "sale",
          merchantInvoiceNumber: orderId,
          customerMsisdn: bkashNumber,
        }),
      },
    );

    const bkashData = await bkashResponse.json();

    if (!bkashResponse.ok) {
      throw new Error(bkashData.message || "Failed to create bKash payment");
    }

    // Update order with payment initiation
    await Order.findByIdAndUpdate(order._id, {
      $set: {
        "paymentDetails.status": "pending",
        "paymentDetails.transactions": [
          {
            amount: amount,
            transactionId: bkashData.paymentID,
            paymentDate: new Date(),
            notes: `bKash payment initiated from ${bkashNumber}`,
          },
        ],
      },
    });

    return NextResponse.json({
      paymentUrl: bkashData.bkashURL,
    });
  } catch (error) {
    console.error("bKash payment creation error:", error);
    return NextResponse.json(
      { message: "Failed to create payment" },
      { status: 500 },
    );
  }
}
