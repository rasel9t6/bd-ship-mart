import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/dbConnect";
import Subcategory from "@/models/Subcategory";
import { revalidatePath } from "next/cache";

export const GET = async () => {
  try {
    await connectToDB();

    const subcategories = await Subcategory.find()
      .populate({
        path: "category",
        select: "name title slug",
      })
      .select(
        "name title slug description icon thumbnail shippingCharge isActive sortOrder",
      )
      .sort({ sortOrder: 1 })
      .lean();

    return new NextResponse(JSON.stringify(subcategories), {
      status: 200,
    });
  } catch (error: unknown) {
    console.error("[Subcategories_GET]", error);
    if (error instanceof Error) {
      return new NextResponse(
        JSON.stringify({
          error: error.message || "Failed to fetch subcategories",
        }),
        {
          status: 500,
        },
      );
    } else {
      return new NextResponse(
        JSON.stringify({ error: "An unknown error occurred" }),
        {
          status: 500,
        },
      );
    }
  }
};

export const POST = async (req: NextRequest) => {
  try {
    await connectToDB();

    const data = await req.json();

    // Create the subcategory
    const subcategory = await Subcategory.create(data);

    // Revalidate the categories path
    revalidatePath("/admin/categories");
    revalidatePath("/categories");

    return NextResponse.json(subcategory, { status: 201 });
  } catch (error: unknown) {
    console.error("[Subcategories_POST]", error);
    if (error instanceof Error) {
      return new NextResponse(
        JSON.stringify({
          error: error.message || "Failed to create subcategory",
        }),
        {
          status: 500,
        },
      );
    } else {
      return new NextResponse(
        JSON.stringify({ error: "An unknown error occurred" }),
        {
          status: 500,
        },
      );
    }
  }
};

export const dynamic = "force-dynamic";
