"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: Record<string, any>;
  maxVisiblePages?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams = {},
  maxVisiblePages = 5,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Calculate visible page range
  const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <nav
      className="flex items-center justify-center space-x-1"
      aria-label="Pagination"
    >
      {/* Previous Button */}
      {currentPage > 1 && (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Link>
      )}

      {/* First Page */}
      {startPage > 1 && (
        <>
          <Link
            href={createPageUrl(1)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            1
          </Link>
          {startPage > 2 && (
            <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500">
              ...
            </span>
          )}
        </>
      )}

      {/* Page Numbers */}
      {pages.map((page) => (
        <Link
          key={page}
          href={createPageUrl(page)}
          className={cn(
            "inline-flex items-center px-3 py-2 text-sm font-medium border rounded-md transition-colors",
            page === currentPage
              ? "bg-blue-600 text-white border-blue-600"
              : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50",
          )}
        >
          {page}
        </Link>
      ))}

      {/* Last Page */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500">
              ...
            </span>
          )}
          <Link
            href={createPageUrl(totalPages)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            {totalPages}
          </Link>
        </>
      )}

      {/* Next Button */}
      {currentPage < totalPages && (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      )}
    </nav>
  );
}
