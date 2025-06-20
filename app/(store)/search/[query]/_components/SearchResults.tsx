"use client";

import { useEffect, useState } from "react";
import { Search, Package, FolderOpen, Layers } from "lucide-react";
import { Button } from "@/ui/button";
import ProductCard from "@/app/(store)/products/_components/ProductCard";
import CategoryCard from "@/app/(store)/_components/CategoryCard";
import SubcategoryCard from "@/app/(store)/_components/SubcategoryCard";
import { CategoryType, ProductType, SubcategoryType } from "@/types/next-utils";
import Link from "next/link";

interface SearchResultsProps {
  query: string;
  searchParams: {
    category?: string;
    subcategory?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  };
}

interface SearchResult {
  products: ProductType[];
  categories: CategoryType[];
  subcategories: SubcategoryType[];
  total: number;
  page: number;
  totalPages: number;
  searchTime: number;
  suggestions: string[];
  facets: {
    categories: Array<{ name: string; count: number }>;
    priceRanges: Array<{ range: string; count: number }>;
    tags: Array<{ name: string; count: number }>;
  };
}

export default function SearchResults({
  query,
  searchParams,
}: SearchResultsProps) {
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });

        const response = await fetch(
          `/api/search/${encodeURIComponent(query)}?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError("Failed to perform search. Please try again.");
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, searchParams]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bondi-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Searching...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
        <Search className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Search Error</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const totalResults =
    results.products.length +
    results.categories.length +
    results.subcategories.length;

  if (totalResults === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No results found
        </h3>
        <p className="text-gray-600 mb-6">
          Try adjusting your search terms or filters to find what you&apos;re
          looking for.
        </p>

        {/* Search Suggestions */}
        {results.suggestions.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-3">Did you mean:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {results.suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-sm"
                  asChild
                >
                  <Link href={`/search/${encodeURIComponent(suggestion)}`}>
                    {suggestion}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Results Summary */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        {results.products.length > 0 && (
          <div className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            <span>{results.products.length} products</span>
          </div>
        )}
        {results.categories.length > 0 && (
          <div className="flex items-center gap-1">
            <FolderOpen className="h-4 w-4" />
            <span>{results.categories.length} categories</span>
          </div>
        )}
        {results.subcategories.length > 0 && (
          <div className="flex items-center gap-1">
            <Layers className="h-4 w-4" />
            <span>{results.subcategories.length} subcategories</span>
          </div>
        )}
      </div>

      {/* Categories Section */}
      {results.categories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.categories.map((category) => (
              <CategoryCard
                key={category.slug}
                category={{
                  _id: category._id?.toString() || "",
                  name: category.name,
                  title: category.title,
                  slug: category.slug,
                  description: category.description || "",
                  icon: category.icon,
                  thumbnail: category.thumbnail,
                  subcategoryDetails: category.subcategories?.map((sub) => ({
                    _id: sub._id?.toString() || "",
                    name: sub.name,
                    slug: sub.slug,
                  })),
                  products: category.products?.map((product) => ({
                    _id: product._id?.toString() || "",
                  })),
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Subcategories Section */}
      {results.subcategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Subcategories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.subcategories.map((subcategory) => (
              <SubcategoryCard
                key={subcategory.slug}
                subcategory={{
                  _id: subcategory._id?.toString() || "",
                  name: subcategory.name,
                  title: subcategory.title,
                  slug: subcategory.slug,
                  description: subcategory.description || "",
                  thumbnail: subcategory.thumbnail || "",
                  category: {
                    _id: subcategory.category?.toString() || "",
                    name: "Category", // This would need to be populated from the API
                    slug: "category",
                  },
                  products: subcategory.products?.map((product) => ({
                    _id: product._id?.toString() || "",
                  })),
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Products Section */}
      {results.products.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {results.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center">
          <div className="flex items-center gap-2">
            {results.page > 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`/search/${encodeURIComponent(query)}?page=${results.page - 1}`}
                >
                  Previous
                </Link>
              </Button>
            )}

            <span className="text-sm text-gray-600">
              Page {results.page} of {results.totalPages}
            </span>

            {results.page < results.totalPages && (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`/search/${encodeURIComponent(query)}?page=${results.page + 1}`}
                >
                  Next
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
