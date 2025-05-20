import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/dbConnect";
import Product from "@/models/Product";

export async function GET(
  request: Request,
  context: { params: { slug: string } },
) {
  try {
    const { slug } = context.params;
    await connectToDB();

    const product = await Product.findOne({ slug }).select("_id");

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}
