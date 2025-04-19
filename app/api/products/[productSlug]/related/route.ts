import { connectToDB } from "@/lib/dbConnect";
import Product from "@/models/Product";
import toast from "react-hot-toast";

import { NextRequest, NextResponse } from "next/server";

interface Product {
  _id: string;
  category?: string;
  tags?: string[];
  price?: {
    bdt: number;
  };
}

interface Query {
  _id: { $ne: string };
  category?: string;
  tags?: { $in: string[] };
  "price.bdt"?: {
    $gte: number;
    $lte: number;
  };
}

export const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<{ productSlug: string }> },
) => {
  try {
    const { productSlug } = await params;
    await connectToDB();
    // Find product by slug
    const product: Product | null = await Product.findOne({
      slug: productSlug,
    });

    if (!product) {
      toast.error("Product not found");
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Create a query to find related products based on category
    const query: Query = {
      _id: { $ne: product._id },
      category: "",
    };

    // If product has a category, find products with the same category
    if (product.category) {
      query.category = product.category;
    }
    // If there's no category, try to match by tags
    else if (product.tags && product.tags.length > 0) {
      query.tags = { $in: product.tags };
    }
    // As a last resort, match by price range
    else if (product.price && product.price.bdt) {
      const price = product.price.bdt;
      const minPrice = price * 0.7; // 30% lower
      const maxPrice = price * 1.3; // 30% higher
      query["price.bdt"] = {
        $gte: minPrice,
        $lte: maxPrice,
      };
    }

    console.log("Related products query:", query);

    // Get related products, limit to 8
    const relatedProducts = await Product.find(query).limit(8).lean();

    console.log(
      `Found ${relatedProducts.length} related products for: ${productSlug}`,
    );

    return NextResponse.json(relatedProducts);
  } catch (error) {
    toast.error("Failed to fetch related products");
    return NextResponse.json(
      { error: error || "Failed to fetch related products" },
      { status: 500 },
    );
  }
};

export const dynamic = "force-dynamic";
