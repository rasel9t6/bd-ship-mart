import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Order from "@/models/Order";
import mongoose from "mongoose";
import { authOptions } from "@/lib/authOption";
import { connectToDB } from "@/lib/dbConnect";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure database connection
    await connectToDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 },
      );
    }

    // Convert userId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const lastOrder = await Order.findOne({ customerInfo: userObjectId })
      .sort({ createdAt: -1 })
      .populate("customerInfo", "name email phone")
      .lean();

    if (!lastOrder) {
      return NextResponse.json(null);
    }

    return NextResponse.json(lastOrder);
  } catch (error) {
    console.error("Error fetching last order:", error);
    return NextResponse.json(
      { error: "Failed to fetch last order" },
      { status: 500 },
    );
  }
}
