import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Order from "@/models/Order";
import { authOptions } from "@/lib/authOption";
import { connectToDB } from "@/lib/dbConnect";
import { renderToStream } from "@react-pdf/renderer";
import InvoiceDocument from "./InvoiceDocument";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();

    // Ensure params.orderId is available
    const { orderId } = await params;
    if (!orderId) {
      return new NextResponse("Order ID is required", { status: 400 });
    }

    const order = await Order.findOne({
      orderId: orderId,
      customerInfo: session.user.id,
    }).populate("customerInfo", "name email address");

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    // Generate PDF stream
    const stream = await renderToStream(InvoiceDocument({ order }));

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      if (chunk instanceof Buffer) {
        chunks.push(chunk);
      } else if (typeof chunk === "string") {
        chunks.push(Buffer.from(chunk));
      } else {
        chunks.push(Buffer.from(chunk));
      }
    }
    const pdfBuffer = Buffer.concat(chunks);

    // Set response headers
    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set(
      "Content-Disposition",
      `attachment; filename="invoice-${order.orderId}.pdf"`,
    );

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("[INVOICE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
