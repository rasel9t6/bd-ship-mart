import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { connectToDB } from "@/lib/dbConnect";
import Order from "@/models/Order";
import { createBkashPayment, updateOrderPaymentStatus } from "@/lib/bkash";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const { amount, orderId, currency, bkashNumber } = await request.json();

    // Validate required fields
    if (!amount || !orderId || !currency || !bkashNumber) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate bKash number format (11 digits starting with 01 followed by 3-9 and then 8 more digits)
    if (!/^01[3-9]\d{8}$/.test(bkashNumber)) {
      return NextResponse.json(
        { message: "Invalid bKash number format" },
        { status: 400 },
      );
    }

    // Find the order
    const order = await Order.findOne({ orderId });
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Check if order is already paid
    if (order.paymentDetails.status === "paid") {
      return NextResponse.json(
        { message: "Order is already paid" },
        { status: 400 },
      );
    }

    // Ensure amount is set properly
    if (!amount.bdt || typeof amount.bdt !== "number" || amount.bdt <= 0) {
      return NextResponse.json(
        { message: "Invalid payment amount" },
        { status: 400 },
      );
    }

    // Amount is already calculated with bKash fee on the client side
    const finalAmount = amount.bdt;
    // Create bKash payment
    const paymentResponse = await createBkashPayment({
      amount: finalAmount,
      orderId,
      bkashNumber,
    });

    if (!paymentResponse.statusCode || paymentResponse.statusCode !== "0000") {
      throw new Error(
        paymentResponse.statusMessage || "Failed to create bKash payment",
      );
    }

    // Update order with payment initiation details
    await updateOrderPaymentStatus(
      orderId,
      {
        paymentID: paymentResponse.paymentID,
        statusCode: paymentResponse.statusCode,
        statusMessage: paymentResponse.statusMessage,
        bkashURL: paymentResponse.bkashURL,
        amount: {
          bdt: finalAmount,
          usd: amount.usd || 0,
          cny: amount.cny || 0,
        },
      },
      "pending",
    );

    return NextResponse.json({
      paymentUrl: paymentResponse.bkashURL,
      paymentID: paymentResponse.paymentID,
      amount: finalAmount,
    });
  } catch (error) {
    console.error("bKash payment creation error:", error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes("Missing required bKash credentials")) {
        return NextResponse.json(
          {
            message:
              "bKash payment service is not properly configured. Please contact support.",
            error: error.message,
          },
          { status: 500 },
        );
      }

      if (error.message.includes("Failed to get bKash token")) {
        return NextResponse.json(
          {
            message:
              "Unable to authenticate with bKash. Please try again later.",
            error: error.message,
          },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      {
        message: "Failed to create payment. Please try again later.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
