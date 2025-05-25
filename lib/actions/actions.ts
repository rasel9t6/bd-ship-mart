"use server";

import Order from "@/models/Order";
import { connectToDB } from "../dbConnect";
import Category from "@/models/Category";
import Product from "@/models/Product";
import User from "@/models/User";
import Subcategory from "@/models/Subcategory";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
const apiUrl = process.env.NEXT_PUBLIC_APP_URL || "";

if (!apiUrl) {
  throw new Error("NEXT_PUBLIC_APP_URL is not found");
}
export const getTotalSales = async () => {
  try {
    await connectToDB();
    const orders = await Order.find().lean();
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (acc, order) => acc + (order.totalAmount?.bdt || 0),
      0,
    );
    return { totalOrders, totalRevenue };
  } catch (error) {
    console.error("Error fetching total sales:", error);
    return { totalOrders: 0, totalRevenue: 0 };
  }
};

export const getSalesPerMonth = async () => {
  try {
    await connectToDB();
    const orders = await Order.find().lean();

    const salesPerMonth = orders.reduce(
      (acc, order) => {
        const monthIndex = new Date(order.createdAt).getMonth();
        acc[monthIndex] =
          (acc[monthIndex] || 0) + (order.totalAmount?.bdt || 0);
        return acc;
      },
      {} as Record<number, number>,
    );

    const graphData = Array.from({ length: 12 }, (_, i) => {
      const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(
        new Date(0, i),
      );
      return { name: month, sales: salesPerMonth[i] || 0 };
    });

    return graphData;
  } catch (error) {
    console.error("Error fetching sales per month:", error);
    return Array.from({ length: 12 }, (_, i) => ({
      name: new Intl.DateTimeFormat("en-US", { month: "short" }).format(
        new Date(0, i),
      ),
      sales: 0,
    }));
  }
};
export const getTotalCustomers = async () => {
  try {
    await connectToDB();
    const users = await User.countDocuments({ role: "user" });
    return users;
  } catch (error) {
    console.error("Error fetching total customers:", error);
    return 0;
  }
};
export async function getCurrencyRate() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_URL}`);
  const currencyRate = await res.json();
  return currencyRate?.conversion_rates?.BDT || 17.5;
}
export async function getCategories() {
  try {
    await connectToDB();
    const category = await Category.find().populate({
      path: "subcategories",
      model: Subcategory,
    });
    return JSON.parse(JSON.stringify(category));
  } catch (error) {
    console.error(`${error}`);
  }
}
export async function getCategory(categoryPath: string | string[]) {
  try {
    // Handle both string paths and array paths
    let segments: string[];

    if (Array.isArray(categoryPath)) {
      segments = categoryPath;
      console.log("Fetching category with array segments:", segments);
    } else {
      segments = categoryPath.split("/").filter(Boolean);
      console.log("Fetching category with string path segments:", segments);
    }

    if (segments.length === 0) {
      console.error("Invalid category path: empty path");
      return null;
    }

    // Create the API path from the segments
    const apiPath = `${apiUrl}/api/categories/${segments.join("/")}`;
    console.log("Fetching from API path:", apiPath);

    const response = await fetch(apiPath, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      console.error(
        `API error (${response.status}): ${response.statusText}`,
        await response.text(),
      );
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in getCategory:", error);
    return null;
  }
}

export async function getProducts() {
  try {
    await connectToDB();
    const products = await Product.find()
      .populate({
        path: "categories",
        model: Category,
        select: "name slug subcategories",
      })
      .populate({
        path: "subcategories",
        model: Subcategory,
        select: "name slug",
      });
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error(`${error}`);
    return [];
  }
}

export async function getProduct({ productSlug }: { productSlug: string }) {
  try {
    await connectToDB();
    const product = await Product.findOne({ slug: productSlug })
      .populate({
        path: "categories",
        model: Category,
        select: "name slug subcategories",
      })
      .populate({
        path: "subcategories",
        model: Subcategory,
        select: "name slug",
      });

    if (!product) {
      return null;
    }

    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error(`Error fetching product: ${error}`);
    return null;
  }
}

export async function getOrders() {
  try {
    await connectToDB();
    const orders = await Order.find().populate({
      path: "products",
      model: Product,
    });
    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    console.error(`${error}`);
  }
}

export async function getOrder({ orderId }: { orderId: string }) {
  try {
    await connectToDB();
    const order = await Order.findById(orderId); // Fix: Removed object wrapping for findById
    return JSON.parse(JSON.stringify(order));
  } catch (error) {
    console.error(`${error}`);
  }
}

export async function getRelatedProducts({
  productSlug,
}: {
  productSlug: string;
}) {
  try {
    const res = await fetch(`${apiUrl}/products/${productSlug}/related`);
    const relatedProducts = await res.json();
    return JSON.parse(JSON.stringify(relatedProducts));
  } catch (error) {
    console.error(`${error}`);
  }
}

export async function getUserOrders(userId: string | undefined) {
  try {
    const res = await User.findById(userId).populate("orders");
    const user = JSON.parse(JSON.stringify(res));
    return user.orders;
  } catch (error) {
    console.error(`${error}`);
  }
}

export async function getUserData() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await connectToDB();
    const user = await User.findById(session.user.id)
      .populate({
        path: "orders",
        model: Order,
        options: { sort: { createdAt: -1 } },
      })
      .select("-password");

    if (!user) {
      throw new Error("User not found");
    }

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error("[GET_USER_DATA_ERROR]", error);
    throw error;
  }
}
