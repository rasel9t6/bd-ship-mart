import Customer from '@/models/Customer';
import Order from '@/models/Order';
import { connectToDB } from '../dbConnect';
import Category from '@/models/Category';
import Product from '@/models/Product';
import User from '@/models/User';
import Subcategory from '@/models/Subcategory';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

if (!apiUrl) {
  throw new Error('NEXT_PUBLIC_API_URL is not found');
}
export const getTotalSales = async () => {
  try {
    await connectToDB();
    const orders = await Order.find();
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (acc, order) => acc + (order.totalAmount?.bdt || 0),
      0
    );
    return { totalOrders, totalRevenue };
  } catch (error) {
    console.error('Error fetching total sales:', error);
    throw new Error('Could not retrieve total sales');
  }
};

export const getTotalCustomers = async () => {
  try {
    await connectToDB();
    const customers = await Customer.find();
    const totalCustomers = customers.length;
    return totalCustomers;
  } catch (error) {
    console.error('Error fetching total customers:', error);
    throw new Error('Could not retrieve total customers');
  }
};

export const getSalesPerMonth = async () => {
  try {
    await connectToDB();
    const orders = await Order.find();

    const salesPerMonth = orders.reduce((acc, order) => {
      const monthIndex = new Date(order.createdAt).getMonth(); // 0 for January --> 11 for December
      acc[monthIndex] = (acc[monthIndex] || 0) + (order.totalAmount || 0); // Ensure it's a number
      return acc;
    }, {});

    const graphData = Array.from({ length: 12 }, (_, i) => {
      const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
        new Date(0, i)
      );
      return { name: month, sales: salesPerMonth[i] || 0 };
    });

    return graphData;
  } catch (error) {
    console.error('Error fetching sales per month:', error);
    throw new Error('Could not retrieve sales per month');
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
      path: 'subcategories',
      model: Subcategory,
    });
    return JSON.parse(JSON.stringify(category));
  } catch (error) {
    console.error(`${error}`);
  }
}
export async function getCategory({ categorySlug }: { categorySlug: string }) {
  try {
    await connectToDB();
    const category = await Category.findOne({ slug: categorySlug }); // Fix: Removed object wrapping for findById
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

export async function getProduct({ productId }: { productId: string }) {
  try {
    await connectToDB();
    const product = await Product.findById(productId); // Fix: Removed object wrapping for findById
    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error(`${error}`);
  }
}

export async function getOrders() {
  try {
    await connectToDB();
    const orders = await Order.find();
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

export async function getCustomers() {
  try {
    await connectToDB();
    const customers = await Customer.find();
    return JSON.parse(JSON.stringify(customers));
  } catch (error) {
    console.error(`${error}`);
  }
}
export async function getRelatedProducts({ productId }: { productId: string }) {
  try {
    const res = await fetch(`${apiUrl}/products/${productId}/related`);
    const relatedProducts = await res.json();
    return relatedProducts;
  } catch (error) {
    console.error(`${error}`);
  }
}

export async function getUserOrders(userId: string | undefined) {
  try {
    const res = await User.findById(userId).populate('orders');
    const user = JSON.parse(JSON.stringify(res));
    return user.orders;
  } catch (error) {
    console.error(`${error}`);
  }
}

export async function getProductDetails(productId: string) {
  try {
    await connectToDB();
    const product = await Product.findById(productId)
      .populate({
        path: 'category',
        model: Category,
        populate: {
          path: 'subcategories',
          model: Subcategory,
        },
      })
      .lean();
    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error(`${error}`);
    return null;
  }
}
