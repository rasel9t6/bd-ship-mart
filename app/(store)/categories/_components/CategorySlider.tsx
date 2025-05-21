"use client";
import React, { useState, useEffect, useRef } from "react";

import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { CategoryType } from "@/types/next-utils";

interface CategorySliderProps {
  items: CategoryType[];
  parentCategoryId?: string; // Optional parent category ID for subcategories
  currentCategoryId?: string; // Current category ID to highlight active item
}

const CategorySlider: React.FC<CategorySliderProps> = ({
  items,
  parentCategoryId,
  currentCategoryId,
}) => {
  const [startIndex, setStartIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemWidth = 180;

  useEffect(() => {
    const updateItemsPerView = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newItemsPerView = Math.floor(containerWidth / itemWidth);
        setItemsPerView(newItemsPerView);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  const showNavigation = items.length > itemsPerView;

  const nextSlide = () => {
    if (startIndex + itemsPerView < items.length) {
      setStartIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (startIndex > 0) {
      setStartIndex((prev) => prev - 1);
    }
  };

  // Generate the correct href based on whether it's a category or subcategory
  const getItemHref = (item: CategoryType) => {
    if (parentCategoryId) {
      // For subcategories, include the parent category in the URL
      return `/categories/${parentCategoryId}/${item.slug}`;
    }
    // For main categories
    return `/categories/${item.slug}`;
  };

  return (
    <div className="relative overflow-hidden p-4">
      <div ref={containerRef}>
        <div
          className={`flex gap-4 ${showNavigation ? "transition-transform duration-300 ease-in-out" : ""}`}
          style={
            showNavigation
              ? { transform: `translateX(-${startIndex * (itemWidth + 16)}px)` }
              : undefined
          }
        >
          {items.map((item, index) => {
            const isActive = item._id === currentCategoryId;
            return (
              <Link
                href={getItemHref(item)}
                key={index}
                className={`group shrink-0 rounded-xl border p-4 transition-all duration-300 hover:shadow-md ${
                  isActive
                    ? "border-bondi-blue bg-bondi-blue/10 shadow-sm"
                    : "border-custom-gray/20 hover:border-bondi-blue/40 hover:bg-bondi-blue/5"
                }`}
                style={{ width: `${itemWidth}px` }}
              >
                <div className="flex items-start gap-3">
                  {/* Icon Section */}
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-gray-50/80 shadow-sm">
                    {item.icon ? (
                      <div className="relative size-full transition-transform duration-300 group-hover:scale-110">
                        <Image
                          src={item.icon}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="size-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="min-w-0 flex-1">
                    <h3
                      className={`line-clamp-2 text-sm font-semibold leading-tight transition-colors ${
                        isActive
                          ? "text-bondi-blue"
                          : "text-gray-800 group-hover:text-bondi-blue"
                      }`}
                    >
                      {item.name}
                    </h3>

                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
                      <Package className="size-3.5 shrink-0" />
                      <span className="text-nowrap">
                        {item?.products?.length === 0 || !item?.products
                          ? "No products"
                          : item?.products?.length === 1
                            ? "1 Product"
                            : `${item?.products?.length} Products`}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        {showNavigation && (
          <>
            <button
              disabled={startIndex === 0}
              onClick={prevSlide}
              className="absolute left-2 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/95 p-2 text-gray-700 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              <svg
                className="size-5"
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              onClick={nextSlide}
              disabled={startIndex + itemsPerView >= items.length}
              className="absolute right-2 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/95 p-2 text-gray-700 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              <svg
                className="size-5"
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CategorySlider;
