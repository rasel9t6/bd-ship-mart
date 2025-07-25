import { NextResponse } from "next/server";
import Order from "@/models/Order";
import { executeBkashPayment, queryBkashPayment } from "@/lib/bkash";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentID = searchParams.get("paymentID");
    const callbackStatus = searchParams.get("status");

    if (!paymentID) {
      throw new Error("Payment ID is required");
    }

    // First check the payment status
    const statusCheck = await queryBkashPayment(paymentID);
 
    if (!statusCheck.statusCode || statusCheck.statusCode !== "0000") {
      throw new Error(
        statusCheck.statusMessage || "Failed to verify payment status",
      );
    }

    // Only execute payment if it's in a valid state
    if (statusCheck.status === "INITIATED") {
      const verifyData = await executeBkashPayment(paymentID);
    
      if (!verifyData.statusCode || verifyData.statusCode !== "0000") {
        throw new Error(
          verifyData.statusMessage || "Failed to execute payment",
        );
      }
    }

    // Find the order using the paymentID
    const order = await Order.findOne({
      "paymentDetails.transactions.transactionId": paymentID,
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Update order status based on payment status
    const finalStatus = callbackStatus === "success" ? "paid" : "failed";
  

    await Order.findByIdAndUpdate(
      order._id,
      {
        $set: {
          "paymentDetails.status": finalStatus,
          "paymentDetails.transactions.$[elem].notes": `Payment ${finalStatus}`,
          "paymentDetails.transactions.$[elem].bkash.status":
            finalStatus === "paid" ? "COMPLETED" : "FAILED",
        },
      },
      {
        arrayFilters: [{ "elem.transactionId": paymentID }],
      },
    );

    // Redirect to success or failure page
    const redirectUrl =
      finalStatus === "paid"
        ? `${process.env.NEXT_PUBLIC_APP_URL}/payment_success`
        : `${process.env.NEXT_PUBLIC_APP_URL}/payment_failed`;

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("bKash callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/payment_failed`,
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // First check the payment status
    const statusCheck = await queryBkashPayment(data.paymentID);

    if (!statusCheck.statusCode || statusCheck.statusCode !== "0000") {
      throw new Error(
        statusCheck.statusMessage || "Failed to verify payment status",
      );
    }

    // Only execute payment if it's in a valid state
    if (statusCheck.status === "INITIATED") {
      const verifyData = await executeBkashPayment(data.paymentID);

      if (!verifyData.statusCode || verifyData.statusCode !== "0000") {
        throw new Error(
          verifyData.statusMessage || "Failed to execute payment",
        );
      }
    }

    // Find the order using the paymentID
    const order = await Order.findOne({
      "paymentDetails.transactions.transactionId": data.paymentID,
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Update order status based on payment status
    const finalStatus = data.status === "success" ? "paid" : "failed";

    await Order.findByIdAndUpdate(
      order._id,
      {
        $set: {
          "paymentDetails.status": finalStatus,
          "paymentDetails.transactions.$[elem].notes": `Payment ${finalStatus}`,
          "paymentDetails.transactions.$[elem].bkash.status":
            finalStatus === "paid" ? "COMPLETED" : "FAILED",
        },
      },
      {
        arrayFilters: [{ "elem.transactionId": data.paymentID }],
      },
    );

    // Redirect to success or failure page
    const redirectUrl =
      finalStatus === "paid"
        ? `${process.env.NEXT_PUBLIC_APP_URL}/payment_success`
        : `${process.env.NEXT_PUBLIC_APP_URL}/payment_failed`;

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("bKash callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/payment_failed`,
    );
  }
}
