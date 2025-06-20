"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/ui/badge";
import { FolderOpen, ArrowRight } from "lucide-react";

interface SubcategoryCardProps {
  subcategory: {
    _id: string;
    name: string;
    title: string;
    description?: string;
    thumbnail?: string;
    slug: string;
    category: {
      _id: string;
      name: string;
      slug: string;
    };
    products?: Array<{ _id: string }>;
  };
  className?: string;
}

export default function SubcategoryCard({ subcategory }: SubcategoryCardProps) {
  return (
    <Link
      href={`/categories/${subcategory.category.slug}/${subcategory.slug}`}
      className="group flex flex-col gap-3 rounded-xl border border-gray-200/80 bg-white/95 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-bondi-blue/20 hover:bg-white"
    >
      {/* Subcategory Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-50">
        <Image
          src={subcategory.thumbnail || "/not-found.gif"}
          alt={subcategory.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Subcategory Info */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-bondi-blue-600" />
            <h3 className="font-semibold text-gray-800 group-hover:text-bondi-blue">
              {subcategory.name}
            </h3>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-bondi-blue transition-colors" />
        </div>

        {subcategory.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {subcategory.description}
          </p>
        )}

        {/* Parent Category */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">in</span>
          <Badge variant="secondary" className="text-xs">
            {subcategory.category.name}
          </Badge>
        </div>

        {/* Product count */}
        {subcategory.products && (
          <p className="text-xs text-gray-500">
            {subcategory.products.length} products
          </p>
        )}
      </div>
    </Link>
  );
}
