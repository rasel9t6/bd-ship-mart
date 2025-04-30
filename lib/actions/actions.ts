import Order from "@/models/Order";
import { connectToDB } from "../dbConnect";
import Category from "@/models/Category";
import Product from "@/models/Product";
import User from "@/models/User";
import Subcategory from "@/models/Subcategory";
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

if (!apiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL is not found");
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
export async function getCategory(categorySlug: string) {
  try {
    await connectToDB();
    const category = await Category.findOne({ slug: categorySlug })
      .populate({
        path: "subcategories",
        model: Subcategory,
      })
      .populate({
        path: "products",
        model: Product,
      });
    return JSON.parse(JSON.stringify(category));
  } catch (error) {
    console.error(`${error}`);
  }
}

export async function getProducts() {
  try {
    await connectToDB();
    const products = await Product.find();
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error(`${error}`);
    return [];
  }
}

export async function getProduct({ productSlug }: { productSlug: string }) {
  try {
    await connectToDB();
    const product = await Product.findOne({ slug: productSlug }).populate({
      path: "categories",
      model: Category,
    });
    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error(`${error}`);
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

// export async function getProductDetails(productId: string) {
//   try {
//     await connectToDB();
//     const product = await Product.findById(productId)
//       .populate({
//         path: 'category',
//         model: Category,
//         populate: {
//           path: 'subcategories',
//           model: Subcategory,
//         },
//       })
//       .lean();
//     return JSON.parse(JSON.stringify(product));
//   } catch (error) {
//     console.error(`${error}`);
//     return null;
//   }
// }
