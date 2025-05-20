import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Order from "@/models/Order";
import User from "@/models/User";
import { authOptions } from "@/lib/authOption";
import { connectToDB } from "@/lib/dbConnect";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    await connectToDB();

    // First, get the user's customer record
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Find orders where the customerInfo matches the user's ID and payment status is either pending or failed
    const orders = await Order.find({
      customerInfo: session.user.id,
      "paymentDetails.status": { $in: ["pending", "failed"] },
    })
      .populate("products.product", "title images")
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching pending orders:", error);
    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
