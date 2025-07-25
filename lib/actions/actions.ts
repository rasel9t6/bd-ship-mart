'use server';

import Order from '@/models/Order';
import { connectToDB } from '../dbConnect';
import Category from '@/models/Category';
import Product from '@/models/Product';
import User from '@/models/User';
import Subcategory from '@/models/Subcategory';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOption';
import { FilterQuery } from 'mongoose';
import { CategoryType, ProductType, SubcategoryType } from '@/types/next-utils';
import { Document } from 'mongoose';
const apiUrl = process.env.NEXT_PUBLIC_APP_URL || '';

if (!apiUrl) {
  throw new Error('NEXT_PUBLIC_APP_URL is not found');
}
export const getTotalSales = async () => {
  try {
    await connectToDB();
    const orders = await Order.find().lean();
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (acc, order) => acc + (order.totalAmount?.bdt || 0),
      0
    );
    return { totalOrders, totalRevenue };
  } catch (error) {
    console.error('Error fetching total sales:', error);
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
      {} as Record<number, number>
    );

    const graphData = Array.from({ length: 12 }, (_, i) => {
      const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
        new Date(0, i)
      );
      return { name: month, sales: salesPerMonth[i] || 0 };
    });

    return graphData;
  } catch (error) {
    console.error('Error fetching sales per month:', error);
    return Array.from({ length: 12 }, (_, i) => ({
      name: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
        new Date(0, i)
      ),
      sales: 0,
    }));
  }
};
export const getTotalCustomers = async () => {
  try {
    await connectToDB();
    const users = await User.countDocuments({ role: 'user' });
    return users;
  } catch (error) {
    console.error('Error fetching total customers:', error);
    return 0;
  }
};
export async function getCurrencyRate() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_URL}`);
  const currencyRate = await res.json();
  return currencyRate?.conversion_rates?.BDT || 17.5;
}
export async function getCategories(
  options: {
    page?: number;
    limit?: number;
    sort?: string;
    search?: string;
    featured?: boolean;
  } = {}
) {
  try {
    await connectToDB();

    const {
      page = 1,
      limit = 12,
      sort = 'name',
      search = '',
      featured = false,
    } = options;
    const skip = (page - 1) * limit;

    // Build query
    const query: FilterQuery<typeof Category> = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (featured) {
      query.featured = true;
    }

    // Build sort
    let sortQuery: Record<string, 1 | -1> = {};
    switch (sort) {
      case 'name':
        sortQuery = { name: 1 };
        break;
      case 'name-desc':
        sortQuery = { name: -1 };
        break;
      case 'newest':
        sortQuery = { createdAt: -1 };
        break;
      case 'oldest':
        sortQuery = { createdAt: 1 };
        break;
      case 'products':
        sortQuery = { 'products.length': -1 };
        break;
      case 'featured':
        sortQuery = { featured: -1, name: 1 };
        break;
      default:
        sortQuery = { name: 1 };
    }

    const categories = await Category.find(query)
      .populate({
        path: 'subcategories',
        model: Subcategory,
      })
      .populate({
        path: 'products',
        model: Product,
        select: '_id',
      })
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    return JSON.parse(JSON.stringify(categories || []));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}
export async function getCategory(categoryPath: string | string[]) {
  try {
    // Handle both string paths and array paths
    let segments: string[];

    if (Array.isArray(categoryPath)) {
      segments = categoryPath;
    } else {
      segments = categoryPath.split('/').filter(Boolean);
    }

    if (segments.length === 0) {
      console.error('Invalid category path: empty path');
      return null;
    }

    // Create the API path from the segments
    const apiPath = `${apiUrl}/api/categories/${segments.join('/')}`;

    const response = await fetch(apiPath, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      console.error(
        `API error (${response.status}): ${response.statusText}`,
        await response.text()
      );
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getCategory:', error);
    return null;
  }
}

export async function getProducts(
  options: {
    page?: number;
    limit?: number;
    sort?: string;
    search?: string;
    category?: string;
    subcategory?: string;
    minPrice?: number;
    maxPrice?: number;
  } = {}
) {
  try {
    await connectToDB();

    const {
      page = 1,
      limit = 24,
      sort = 'newest',
      search = '',
      category = '',
      subcategory = '',
      minPrice,
      maxPrice,
    } = options;

    const skip = (page - 1) * limit;

    // Build query
    const query: FilterQuery<typeof Product> = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (category) {
      // First get the category ID
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.categories = categoryDoc._id;
      }
    }

    if (subcategory) {
      // First get the subcategory ID
      const subcategoryDoc = await Subcategory.findOne({ slug: subcategory });
      if (subcategoryDoc) {
        query.subcategories = subcategoryDoc._id;
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    // Note: stock and featured fields don't exist in the Product schema
    // so we're removing those filters for now

    // Build sort
    let sortQuery: Record<string, 1 | -1> = {};
    switch (sort) {
      case 'newest':
        sortQuery = { createdAt: -1 };
        break;
      case 'oldest':
        sortQuery = { createdAt: 1 };
        break;
      case 'name':
        sortQuery = { title: 1 };
        break;
      case 'name-desc':
        sortQuery = { title: -1 };
        break;
      case 'price-low':
        sortQuery = { 'price.bdt': 1 };
        break;
      case 'price-high':
        sortQuery = { 'price.bdt': -1 };
        break;
      case 'popular':
        sortQuery = { createdAt: -1 };
        break;
      case 'rating':
        sortQuery = { createdAt: -1 };
        break;
      case 'featured':
        sortQuery = { createdAt: -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    const products = await Product.find(query)
      .populate({
        path: 'categories',
        model: Category,
        select: 'name slug subcategories',
      })
      .populate({
        path: 'subcategories',
        model: Subcategory,
        select: 'name slug',
      })
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    return JSON.parse(JSON.stringify(products || []));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProduct({ productSlug }: { productSlug: string }) {
  try {
    await connectToDB();
    const product = await Product.findOne({ slug: productSlug })
      .populate({
        path: 'categories',
        model: Category,
        select: 'name slug subcategories',
      })
      .populate({
        path: 'subcategories',
        model: Subcategory,
        select: 'name slug',
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
// Add this to your actions file - Optimized for your current Product schema

export async function getFeaturedProducts(options: { limit?: number } = {}) {
  try {
    await connectToDB();
    const { limit = 12 } = options;

    // Query for featured products with optimized fields selection
    const products = await Product.find({
      featured: true, // Use the featured field
    })
      .populate({
        path: 'categories',
        model: Category,
        select: 'name slug', // Only select needed fields
      })
      .populate({
        path: 'subcategories',
        model: Subcategory,
        select: 'name slug', // Only select needed fields
      })
      .select(
        'sku title slug description media price minimumOrderQuantity createdAt categories subcategories featured featuredPriority'
      ) // Select fields matching your schema
      .sort({ featuredPriority: -1, createdAt: -1 }) // Sort by priority then newest
      .limit(limit)
      .lean(); // Use lean() for better performance

    return JSON.parse(JSON.stringify(products || []));
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

// Fallback version - gets newest products if no featured products exist
export async function getFeaturedProducts_Fallback(
  options: { limit?: number } = {}
) {
  try {
    await connectToDB();
    const { limit = 12 } = options;

    // First try to get featured products
    let products = await Product.find({ featured: true })
      .populate({
        path: 'categories',
        model: Category,
        select: 'name slug',
      })
      .populate({
        path: 'subcategories',
        model: Subcategory,
        select: 'name slug',
      })
      .select(
        'sku title slug description media price minimumOrderQuantity createdAt categories subcategories featured featuredPriority'
      )
      .sort({ featuredPriority: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    // If no featured products, fallback to newest products
    if (!products || products.length === 0) {
      products = await Product.find({})
        .populate({
          path: 'categories',
          model: Category,
          select: 'name slug',
        })
        .populate({
          path: 'subcategories',
          model: Subcategory,
          select: 'name slug',
        })
        .select(
          'sku title slug description media price minimumOrderQuantity createdAt categories subcategories'
        )
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    }

    return JSON.parse(JSON.stringify(products || []));
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

// Mixed approach - some featured + some newest (great for variety)
export async function getFeaturedProducts_Mixed(
  options: { limit?: number } = {}
) {
  try {
    await connectToDB();
    const { limit = 12 } = options;

    // Get half from featured products, half from newest
    const featuredLimit = Math.floor(limit / 2);
    const newestLimit = limit - featuredLimit;

    const [featuredProducts, newestProducts] = await Promise.all([
      // Featured products
      Product.find({ featured: true })
        .populate({
          path: 'categories',
          model: Category,
          select: 'name slug',
        })
        .populate({
          path: 'subcategories',
          model: Subcategory,
          select: 'name slug',
        })
        .select(
          'sku title slug description media price minimumOrderQuantity createdAt categories subcategories featured featuredPriority'
        )
        .sort({ featuredPriority: -1, createdAt: -1 })
        .limit(featuredLimit)
        .lean(),

      // Newest products (excluding already featured ones)
      Product.find({ featured: { $ne: true } })
        .populate({
          path: 'categories',
          model: Category,
          select: 'name slug',
        })
        .populate({
          path: 'subcategories',
          model: Subcategory,
          select: 'name slug',
        })
        .select(
          'sku title slug description media price minimumOrderQuantity createdAt categories subcategories'
        )
        .sort({ createdAt: -1 })
        .limit(newestLimit)
        .lean(),
    ]);

    // Combine the results
    const allProducts = [...featuredProducts, ...newestProducts];

    return JSON.parse(JSON.stringify(allProducts || []));
  } catch (error) {
    console.error('Error fetching mixed featured products:', error);
    return [];
  }
}

export async function getOrders() {
  try {
    await connectToDB();
    const orders = await Order.find().populate({
      path: 'products',
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
    await connectToDB();
    // Find the current product
    const product = await Product.findOne({ slug: productSlug }).populate({
      path: 'categories',
      model: Category,
      select: 'name slug subcategories',
    });

    if (!product) {
      return [];
    }

    // Create a query to find related products
    const query: FilterQuery<ProductType> = {
      _id: { $ne: product._id },
    };

    // If product has categories, find products with the same categories
    if (product.categories && product.categories.length > 0) {
      query.categories = {
        $in: product.categories.map((cat: Document) => cat._id),
      };
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
      query['price.bdt'] = {
        $gte: minPrice,
        $lte: maxPrice,
      };
    }

    // Get related products, limit to 8
    const relatedProducts = await Product.find(query)
      .populate({
        path: 'categories',
        model: Category,
        select: 'name slug subcategories',
      })
      .populate({
        path: 'subcategories',
        model: Subcategory,
        select: 'name slug',
      })
      .limit(8)
      .lean();

    return JSON.parse(JSON.stringify(relatedProducts));
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
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

export async function getUserData() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    await connectToDB();
    const user = await User.findById(session.user.id)
      .populate({
        path: 'orders',
        model: Order,
        options: { sort: { createdAt: -1 } },
      })
      .select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error('[GET_USER_DATA_ERROR]', error);
    throw error;
  }
}

// ==================== ENTERPRISE SEARCH FUNCTIONS ====================

export interface SearchFilters {
  categories?: string[];
  subcategories?: string[];
  priceRange?: { min: number; max: number };
  tags?: string[];
  inStock?: boolean;
  sortBy?: 'relevance' | 'price_low' | 'price_high' | 'newest' | 'popular';
  limit?: number;
  page?: number;
  searchType?: 'all' | 'products' | 'categories' | 'subcategories';
}

export interface SearchResult {
  products: ProductType[];
  categories: CategoryType[];
  subcategories: SubcategoryType[];
  total: number;
  page: number;
  totalPages: number;
  facets: {
    categories: Array<{ name: string; count: number }>;
    priceRanges: Array<{ range: string; count: number }>;
    tags: Array<{ name: string; count: number }>;
  };
  suggestions: string[];
  searchTime: number;
}

export async function advancedSearch(
  query: string,
  filters: SearchFilters = {},
  userId?: string
): Promise<SearchResult> {
  const startTime = Date.now();

  try {
    await connectToDB();

    const searchType = filters.searchType || 'all';
    const page = filters.page || 1;
    const limit = filters.limit || 20;

    // Initialize results
    let products: ProductType[] = [];
    let categories: CategoryType[] = [];
    let subcategories: SubcategoryType[] = [];
    let total = 0;

    // Search Products
    if (searchType === 'all' || searchType === 'products') {
      const productResults = await searchProducts(query, filters, page, limit);
      products = productResults.products;
      total += productResults.total;
    }

    // Search Categories
    if (searchType === 'all' || searchType === 'categories') {
      const categoryResults = await searchCategories(query, page, limit);
      categories = categoryResults.categories;
      total += categoryResults.total;
    }

    // Search Subcategories
    if (searchType === 'all' || searchType === 'subcategories') {
      const subcategoryResults = await searchSubcategories(query, page, limit);
      subcategories = subcategoryResults.subcategories;
      total += subcategoryResults.total;
    }

    // Get facets (only from products for now)
    const searchFacets = await getSearchFacets(query);

    // Get search suggestions
    const suggestions = await getSearchSuggestions(query);

    // Log search analytics
    await logSearchAnalytics(query, total, Date.now() - startTime, userId);

    return {
      products,
      categories,
      subcategories,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      facets: searchFacets,
      suggestions,
      searchTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Advanced search error:', error);
    throw new Error('Search failed');
  }
}

async function searchProducts(
  query: string,
  filters: SearchFilters,
  page: number,
  limit: number
): Promise<{ products: ProductType[]; total: number }> {
  // Build search query
  const searchQuery: Record<string, unknown> = {};
  const $or: Array<Record<string, unknown>> = [];

  if (query.trim()) {
    // Multi-field search with relevance scoring
    $or.push(
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } },
      { sku: { $regex: query, $options: 'i' } }
    );

    // Fuzzy search for typos
    const words = query.split(' ').filter((word) => word.length > 2);
    words.forEach((word) => {
      $or.push(
        { title: { $regex: word, $options: 'i' } },
        { tags: { $in: [new RegExp(word, 'i')] } }
      );
    });
  }

  if ($or.length > 0) {
    searchQuery.$or = $or;
  }

  // Apply filters
  if (filters.categories?.length) {
    const categoryIds = await Category.find({
      slug: { $in: filters.categories },
    }).select('_id');
    searchQuery.categories = { $in: categoryIds.map((cat) => cat._id) };
  }

  if (filters.subcategories?.length) {
    const subcategoryIds = await Subcategory.find({
      slug: { $in: filters.subcategories },
    }).select('_id');
    searchQuery.subcategories = { $in: subcategoryIds.map((sub) => sub._id) };
  }

  if (filters.priceRange) {
    searchQuery['price.bdt'] = {
      $gte: filters.priceRange.min,
      $lte: filters.priceRange.max,
    };
  }

  if (filters.tags?.length) {
    searchQuery.tags = { $in: filters.tags };
  }

  // Build aggregation pipeline for advanced search
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pipeline: any[] = [
    { $match: searchQuery },
    {
      $lookup: {
        from: 'categories',
        localField: 'categories',
        foreignField: '_id',
        as: 'categoryDetails',
      },
    },
    {
      $lookup: {
        from: 'subcategories',
        localField: 'subcategories',
        foreignField: '_id',
        as: 'subcategoryDetails',
      },
    },
    {
      $addFields: {
        relevanceScore: {
          $add: [
            {
              $cond: [
                {
                  $regexMatch: { input: '$title', regex: query, options: 'i' },
                },
                10,
                0,
              ],
            },
            {
              $cond: [
                {
                  $regexMatch: {
                    input: '$description',
                    regex: query,
                    options: 'i',
                  },
                },
                5,
                0,
              ],
            },
            { $cond: [{ $in: [query, '$tags'] }, 8, 0] },
            {
              $cond: [
                { $regexMatch: { input: '$sku', regex: query, options: 'i' } },
                15,
                0,
              ],
            },
          ],
        },
      },
    },
  ];

  // Add sorting
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortStage: any = {};
  switch (filters.sortBy) {
    case 'price_low':
      sortStage['price.bdt'] = 1;
      break;
    case 'price_high':
      sortStage['price.bdt'] = -1;
      break;
    case 'newest':
      sortStage.createdAt = -1;
      break;
    case 'popular':
      sortStage.relevanceScore = -1;
      break;
    default:
      sortStage.relevanceScore = -1;
  }

  pipeline.push({ $sort: sortStage });

  // Add pagination
  const skip = (page - 1) * limit;
  pipeline.push({ $skip: skip }, { $limit: limit });

  // Execute search
  const products = await Product.aggregate(pipeline);

  // Get total count for pagination
  const countPipeline = [{ $match: searchQuery }, { $count: 'total' }];
  const countResult = await Product.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  return {
    products: JSON.parse(JSON.stringify(products)),
    total,
  };
}

async function searchCategories(
  query: string,
  page: number,
  limit: number
): Promise<{ categories: CategoryType[]; total: number }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searchQuery: any = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const $or: any[] = [];

  if (query.trim()) {
    $or.push(
      { name: { $regex: query, $options: 'i' } },
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    );

    // Fuzzy search for typos
    const words = query.split(' ').filter((word) => word.length > 2);
    words.forEach((word) => {
      $or.push(
        { name: { $regex: word, $options: 'i' } },
        { title: { $regex: word, $options: 'i' } }
      );
    });
  }

  if ($or.length > 0) {
    searchQuery.$or = $or;
  }

  // Add isActive filter
  searchQuery.isActive = true;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pipeline: any[] = [
    { $match: searchQuery },
    {
      $lookup: {
        from: 'subcategories',
        localField: '_id',
        foreignField: 'category',
        as: 'subcategoryDetails',
      },
    },
    {
      $addFields: {
        relevanceScore: {
          $add: [
            {
              $cond: [
                { $regexMatch: { input: '$name', regex: query, options: 'i' } },
                15,
                0,
              ],
            },
            {
              $cond: [
                {
                  $regexMatch: { input: '$title', regex: query, options: 'i' },
                },
                10,
                0,
              ],
            },
            {
              $cond: [
                {
                  $regexMatch: {
                    input: '$description',
                    regex: query,
                    options: 'i',
                  },
                },
                5,
                0,
              ],
            },
          ],
        },
      },
    },
    { $sort: { relevanceScore: -1, sortOrder: 1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ];

  const categories = await Category.aggregate(pipeline);

  // Get total count
  const countResult = await Category.countDocuments(searchQuery);

  return {
    categories: JSON.parse(JSON.stringify(categories)),
    total: countResult,
  };
}

async function searchSubcategories(
  query: string,
  page: number,
  limit: number
): Promise<{ subcategories: SubcategoryType[]; total: number }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searchQuery: any = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const $or: any[] = [];

  if (query.trim()) {
    $or.push(
      { name: { $regex: query, $options: 'i' } },
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    );

    // Fuzzy search for typos
    const words = query.split(' ').filter((word) => word.length > 2);
    words.forEach((word) => {
      $or.push(
        { name: { $regex: word, $options: 'i' } },
        { title: { $regex: word, $options: 'i' } }
      );
    });
  }

  if ($or.length > 0) {
    searchQuery.$or = $or;
  }

  // Add isActive filter
  searchQuery.isActive = true;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pipeline: any[] = [
    { $match: searchQuery },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryDetails',
      },
    },
    {
      $addFields: {
        relevanceScore: {
          $add: [
            {
              $cond: [
                { $regexMatch: { input: '$name', regex: query, options: 'i' } },
                15,
                0,
              ],
            },
            {
              $cond: [
                {
                  $regexMatch: { input: '$title', regex: query, options: 'i' },
                },
                10,
                0,
              ],
            },
            {
              $cond: [
                {
                  $regexMatch: {
                    input: '$description',
                    regex: query,
                    options: 'i',
                  },
                },
                5,
                0,
              ],
            },
          ],
        },
      },
    },
    { $sort: { relevanceScore: -1, sortOrder: 1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ];

  const subcategories = await Subcategory.aggregate(pipeline);

  // Get total count
  const countResult = await Subcategory.countDocuments(searchQuery);

  return {
    subcategories: JSON.parse(JSON.stringify(subcategories)),
    total: countResult,
  };
}

export async function getSearchSuggestions(query: string): Promise<string[]> {
  try {
    await connectToDB();

    if (!query.trim() || query.length < 2) return [];

    const searchTerm = query.toLowerCase().trim();

    // Get product suggestions with better relevance scoring
    const productSuggestions = await Product.aggregate([
      {
        $match: {
          $or: [
            { title: { $regex: searchTerm, $options: 'i' } },
            { tags: { $in: [new RegExp(searchTerm, 'i')] } },
            { sku: { $regex: searchTerm, $options: 'i' } },
          ],
        },
      },
      {
        $addFields: {
          relevanceScore: {
            $add: [
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: '$title',
                      regex: searchTerm,
                      options: 'i',
                    },
                  },
                  10,
                  0,
                ],
              },
              { $cond: [{ $in: [searchTerm, '$tags'] }, 8, 0] },
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: '$sku',
                      regex: searchTerm,
                      options: 'i',
                    },
                  },
                  15,
                  0,
                ],
              },
            ],
          },
        },
      },
      { $sort: { relevanceScore: -1 } },
      { $limit: 4 },
      { $project: { title: 1, _id: 0 } },
    ]);

    // Get category suggestions
    const categorySuggestions = await Category.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { title: { $regex: searchTerm, $options: 'i' } },
          ],
          isActive: true,
        },
      },
      {
        $addFields: {
          relevanceScore: {
            $add: [
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: '$name',
                      regex: searchTerm,
                      options: 'i',
                    },
                  },
                  12,
                  0,
                ],
              },
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: '$title',
                      regex: searchTerm,
                      options: 'i',
                    },
                  },
                  10,
                  0,
                ],
              },
            ],
          },
        },
      },
      { $sort: { relevanceScore: -1 } },
      { $limit: 2 },
      { $project: { name: 1, title: 1, _id: 0 } },
    ]);

    // Get subcategory suggestions
    const subcategorySuggestions = await Subcategory.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { title: { $regex: searchTerm, $options: 'i' } },
          ],
          isActive: true,
        },
      },
      {
        $addFields: {
          relevanceScore: {
            $add: [
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: '$name',
                      regex: searchTerm,
                      options: 'i',
                    },
                  },
                  12,
                  0,
                ],
              },
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: '$title',
                      regex: searchTerm,
                      options: 'i',
                    },
                  },
                  10,
                  0,
                ],
              },
            ],
          },
        },
      },
      { $sort: { relevanceScore: -1 } },
      { $limit: 2 },
      { $project: { name: 1, title: 1, _id: 0 } },
    ]);

    // Combine and deduplicate suggestions with relevance ordering
    const allSuggestions = [
      ...productSuggestions.map((p) => ({ text: p.title, score: 10 })),
      ...categorySuggestions.map((c) => ({
        text: c.name || c.title,
        score: 12,
      })),
      ...subcategorySuggestions.map((s) => ({
        text: s.name || s.title,
        score: 12,
      })),
    ];

    // Remove duplicates and sort by relevance
    const uniqueSuggestions = allSuggestions
      .filter(
        (suggestion, index, self) =>
          index ===
          self.findIndex(
            (s) => s.text.toLowerCase() === suggestion.text.toLowerCase()
          )
      )
      .sort((a, b) => b.score - a.score)
      .map((s) => s.text);

    return uniqueSuggestions.slice(0, 8);
  } catch (error) {
    console.error('Search suggestions error:', error);
    return [];
  }
}

export async function getSearchFacets(query: string) {
  try {
    await connectToDB();

    // Ensure searchQuery is a valid MongoDB query object
    const matchQuery = typeof query === 'string' ? {} : query || {};

    const [categoryFacets, priceFacets, tagFacets] = await Promise.all([
      // Category facets
      Product.aggregate([
        { $match: matchQuery },
        { $unwind: '$categories' },
        {
          $lookup: {
            from: 'categories',
            localField: 'categories',
            foreignField: '_id',
            as: 'category',
          },
        },
        { $unwind: '$category' },
        {
          $group: {
            _id: '$category.name',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Price range facets
      Product.aggregate([
        { $match: matchQuery },
        {
          $bucket: {
            groupBy: '$price.bdt',
            boundaries: [0, 1000, 5000, 10000, 50000, 100000],
            default: 'Above 100000',
            output: {
              count: { $sum: 1 },
            },
          },
        },
      ]),

      // Tag facets
      Product.aggregate([
        { $match: matchQuery },
        { $unwind: '$tags' },
        {
          $group: {
            _id: '$tags',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),
    ]);

    return {
      categories: categoryFacets.map((f) => ({ name: f._id, count: f.count })),
      priceRanges: priceFacets.map((f) => ({ range: f._id, count: f.count })),
      tags: tagFacets.map((f) => ({ name: f._id, count: f.count })),
    };
  } catch (error) {
    console.error('Facets error:', error);
    return { categories: [], priceRanges: [], tags: [] };
  }
}

export async function logSearchAnalytics(
  query: string,
  resultCount: number,
  searchTime: number,
  userId?: string
) {
  try {
    const analyticsData = {
      query: query.toLowerCase().trim(),
      userId,
      resultCount,
      searchTime,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      hour: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
    };

    // In a production environment, you would save this to a SearchAnalytics collection
    // For now, we'll log it and could implement a simple in-memory cache

    console.log('Search Analytics:', analyticsData);

    // TODO: Implement proper analytics storage
    // await SearchAnalytics.create(analyticsData);

    // TODO: Update popular searches cache periodically
    // This could be done with a cron job or background task
  } catch (error) {
    console.error('Analytics logging error:', error);
  }
}

export async function getPopularSearches(limit: number = 10) {
  try {
    await connectToDB();

    // In a production environment, you would have a SearchAnalytics collection
    // For now, we'll implement a more robust fallback system

    // Method 1: Get popular searches from recent product titles and categories
    const popularFromProducts = await Product.aggregate([
      { $sample: { size: 50 } }, // Random sample for variety
      { $project: { title: 1, tags: 1 } },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$title',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: Math.ceil(limit / 2) },
    ]);

    // Method 2: Get popular category names
    const popularFromCategories = await Category.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: 20 } },
      { $project: { name: 1, title: 1 } },
      { $sort: { sortOrder: 1 } },
      { $limit: Math.ceil(limit / 2) },
    ]);

    // Method 3: Get popular subcategory names
    const popularFromSubcategories = await Subcategory.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: 15 } },
      { $project: { name: 1, title: 1 } },
      { $sort: { sortOrder: 1 } },
      { $limit: Math.ceil(limit / 3) },
    ]);

    // Combine and deduplicate results
    const allSuggestions = [
      ...popularFromProducts.map((p) => p._id),
      ...popularFromCategories.map((c) => c.name || c.title),
      ...popularFromSubcategories.map((s) => s.name || s.title),
    ];

    // Remove duplicates and limit
    const uniqueSuggestions = [...new Set(allSuggestions)].slice(0, limit);

    // If we don't have enough suggestions, add some fallback popular terms
    if (uniqueSuggestions.length < limit) {
      const fallbackTerms = [
        'electronics',
        'clothing',
        'home decor',
        'sports',
        'books',
        'toys',
        'kitchen',
        'garden',
        'automotive',
        'health',
        'fashion',
        'accessories',
        'beauty',
        'jewelry',
        'shoes',
      ];

      const remainingCount = limit - uniqueSuggestions.length;
      const fallbackSuggestions = fallbackTerms
        .filter((term) => !uniqueSuggestions.includes(term))
        .slice(0, remainingCount);

      uniqueSuggestions.push(...fallbackSuggestions);
    }

    return uniqueSuggestions;
  } catch (error) {
    console.error('Popular searches error:', error);

    // Fallback to static popular searches if database fails
    return [
      'electronics',
      'clothing',
      'home decor',
      'sports',
      'books',
      'toys',
      'kitchen',
      'garden',
      'automotive',
      'health',
    ].slice(0, limit);
  }
}

export async function getTrendingProducts(limit: number = 8) {
  try {
    await connectToDB();

    const trending = await Product.find()
      .populate({
        path: 'categories',
        select: 'name slug',
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return JSON.parse(JSON.stringify(trending));
  } catch (error) {
    console.error('Trending products error:', error);
    return [];
  }
}

// Get trending searches based on recent activity (simulated)
export async function getTrendingSearches(limit: number = 8) {
  try {
    // In a real implementation, this would query recent search analytics
    // For now, we'll return a mix of popular terms with some randomization

    const baseTrendingTerms = [
      'smartphone',
      'laptop',
      'headphones',
      'watch',
      'camera',
      'shoes',
      'bag',
      'dress',
      'shirt',
      'jeans',
      'coffee',
      'tea',
      'snacks',
      'beverages',
      'food',
    ];

    // Shuffle array to simulate trending changes
    const shuffled = [...baseTrendingTerms].sort(() => Math.random() - 0.5);

    return shuffled.slice(0, limit);
  } catch (error) {
    console.error('Trending searches error:', error);
    return [];
  }
}
