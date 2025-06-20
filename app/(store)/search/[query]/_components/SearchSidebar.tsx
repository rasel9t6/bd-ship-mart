"use client";

import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { TrendingUp, Zap, Filter } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchSidebarProps {
  query: string;
  searchParams: {
    category?: string;
    subcategory?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  };
  popularSearches: string[];
  trendingSearches: string[];
}

export default function SearchSidebar({
  query,
  searchParams,
  popularSearches,
  trendingSearches,
}: SearchSidebarProps) {
  const router = useRouter();

  const handleSearchClick = (searchTerm: string) => {
    router.push(`/search/${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="space-y-6">
      {/* Trending Searches */}
      {trendingSearches.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              Trending Now
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((search, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-orange-50 hover:text-orange-600 border-orange-200"
                  onClick={() => handleSearchClick(search)}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Searches */}
      {popularSearches.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Popular Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearchClick(search)}
                  className="w-full text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 p-2 rounded transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            Search Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sort Options */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bondi-blue-500"
                defaultValue={searchParams.sort || "relevance"}
                onChange={(e) => {
                  const newParams = new URLSearchParams(
                    searchParams as Record<string, string>,
                  );
                  newParams.set("sort", e.target.value);
                  router.push(
                    `/search/${encodeURIComponent(query)}?${newParams.toString()}`,
                  );
                }}
              >
                <option value="relevance">Relevance</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bondi-blue-500"
                  defaultValue={searchParams.minPrice}
                  onChange={(e) => {
                    const newParams = new URLSearchParams(
                      searchParams as Record<string, string>,
                    );
                    if (e.target.value) {
                      newParams.set("minPrice", e.target.value);
                    } else {
                      newParams.delete("minPrice");
                    }
                    router.push(
                      `/search/${encodeURIComponent(query)}?${newParams.toString()}`,
                    );
                  }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bondi-blue-500"
                  defaultValue={searchParams.maxPrice}
                  onChange={(e) => {
                    const newParams = new URLSearchParams(
                      searchParams as Record<string, string>,
                    );
                    if (e.target.value) {
                      newParams.set("maxPrice", e.target.value);
                    } else {
                      newParams.delete("maxPrice");
                    }
                    router.push(
                      `/search/${encodeURIComponent(query)}?${newParams.toString()}`,
                    );
                  }}
                />
              </div>
            </div>

            {/* Clear Filters */}
            {(searchParams.category ||
              searchParams.subcategory ||
              searchParams.minPrice ||
              searchParams.maxPrice ||
              searchParams.sort) && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  router.push(`/search/${encodeURIComponent(query)}`);
                }}
              >
                Clear All Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
