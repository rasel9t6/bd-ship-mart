import { Metadata } from "next";
import { getProducts, getCategories } from "@/lib/actions/actions";
import { generateBaseMetadata } from "@/lib/seo";
import ProductFilters from "./_components/ProductFilters";
import ProductSort from "./_components/ProductSort";
import ProductGrid from "./_components/ProductGrid";
import ProductSearch from "./_components/ProductSearch";

export const metadata: Metadata = {
  ...generateBaseMetadata(),
  title: "Products - K2B EXPRESS",
  description:
    "Browse our complete collection of shipping and logistics products. Find quality products with competitive prices and fast delivery.",
  keywords: [
    "products",
    "shipping products",
    "logistics products",
    "buy online",
  ],
  openGraph: {
    ...generateBaseMetadata().openGraph,
    title: "Products - K2B EXPRESS",
    description:
      "Browse our complete collection of shipping and logistics products.",
  },
};

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    sort?: string;
    search?: string;
    category?: string;
    subcategory?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = parseInt(params.limit || "24");
  const sort = params.sort || "newest";
  const search = params.search || "";
  const category = params.category || "";
  const subcategory = params.subcategory || "";
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;

  // Get products with advanced filtering and pagination
  const products = await getProducts({
    page,
    limit,
    sort,
    search,
    category,
    subcategory,
    minPrice,
    maxPrice,
  });

  // Get categories for filter sidebar
  const categories = await getCategories({ limit: 50 });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              All Products
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our comprehensive collection of shipping and logistics
              products
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <ProductSearch currentSearch={search} />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <ProductFilters
              categories={categories}
              currentCategory={category}
              currentSubcategory={subcategory}
              currentMinPrice={minPrice}
              currentMaxPrice={maxPrice}
            />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Sort and Results Count */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="text-sm text-gray-600">
                Showing {products.length} products
              </div>
              <ProductSort currentSort={sort} />
            </div>

            {/* Products Grid */}
            <ProductGrid products={products} currentPage={page} />
          </div>
        </div>
      </div>
    </div>
  );
}
