// app/api/orders/[orderId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import Order from "@/models/Order";
import { authOptions } from "@/lib/authOption";
import { connectToDB } from "@/lib/dbConnect";

type Params = Promise<{ orderId: string }>;
export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const order = await Order.findOne({ orderId });
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Check if the order belongs to the current user
    if (order.customerInfo.toString() !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { message: "Failed to fetch order details" },
      { status: 500 },
    );
  }
}

// PATCH /api/orders/[orderId] - Update a specific order
export async function PATCH(
  request: NextRequest,
  { params }: { params: Params },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const { orderId } = await params;
    const updateData = await request.json();

    // Find and update the order
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true },
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}
