import { NextResponse } from "next/server";

import Category from "@/models/Category";
import { connectToDB } from "@/lib/dbConnect";

interface ShippingCost {
  byAir: { min: number; max: number };
  bySea: { min: number; max: number };
}

interface SubCategory {
  name: string;
  cost: ShippingCost;
}

interface PopulatedSubCategory {
  name: string;
  slug: string;
  shippingCharge?: {
    byAir?: { min: number; max: number };
    bySea?: { min: number; max: number };
  };
}

export async function GET() {
  try {
    await connectToDB();

    const categories = await Category.find({ isActive: true })
      .select("name title slug shippingCharge subcategories")
      .populate({
        path: "subcategories",
        select: "name title slug shippingCharge",
        match: { isActive: true },
      });

    // Transform the data to match the frontend structure
    const transformedData = categories.reduce((acc, category) => {
      acc[category.slug] = {
        name: category.name,
        cost: null,
        subcategories: category.subcategories.reduce(
          (
            subAcc: Record<string, SubCategory>,
            subcategory: PopulatedSubCategory,
          ) => {
            subAcc[subcategory.slug] = {
              name: subcategory.name,
              cost: {
                byAir: subcategory.shippingCharge?.byAir || { min: 0, max: 0 },
                bySea: subcategory.shippingCharge?.bySea || { min: 0, max: 0 },
              },
            };
            return subAcc;
          },
          {},
        ),
      };
      return acc;
    }, {});

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("[SHIPPING_COSTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
