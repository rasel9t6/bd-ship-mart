import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/dbConnect";
import Category from "@/models/Category";
import Subcategory from "@/models/Subcategory";
import { Document } from "mongoose";

interface ShippingCost {
  byAir: { min: number; max: number };
  bySea: { min: number; max: number };
}

interface SubCategoryData {
  name: string;
  cost: ShippingCost;
}

interface CategoryData {
  name: string;
  cost: ShippingCost;
  subcategories: Record<string, SubCategoryData>;
}

interface CategoryDocument extends Document {
  name: string;
  slug: string;
  shippingCharge: ShippingCost;
  subcategories: Array<{
    name: string;
    slug: string;
    shippingCharge: ShippingCost;
  }>;
}

export async function GET() {
  try {
    await connectToDB();

    // Fetch all categories with their subcategories
    const categories = (await Category.find({ isActive: true })
      .populate({
        path: "subcategories",
        model: Subcategory,
        match: { isActive: true },
        select: "name slug shippingCharge",
      })
      .select("name slug shippingCharge")
      .sort({ sortOrder: 1 })) as CategoryDocument[];

    // Transform the data to match the expected format
    const shippingCostsData = categories.reduce<Record<string, CategoryData>>(
      (acc, category) => {
        // Create subcategories object
        const subcategories = (category.subcategories || []).reduce<
          Record<string, SubCategoryData>
        >((subAcc, sub) => {
          subAcc[sub.slug] = {
            name: sub.name,
            cost: sub.shippingCharge || {
              byAir: { min: 0, max: 0 },
              bySea: { min: 0, max: 0 },
            },
          };
          return subAcc;
        }, {});

        // Add category to accumulator
        acc[category.slug] = {
          name: category.name,
          cost: category.shippingCharge || {
            byAir: { min: 0, max: 0 },
            bySea: { min: 0, max: 0 },
          },
          subcategories,
        };

        return acc;
      },
      {},
    );

    return NextResponse.json(shippingCostsData);
  } catch (error) {
    console.error("[SHIPPING_COSTS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch shipping costs" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
