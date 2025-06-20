"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "motion/react";

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemWidth = 200;
  const itemGap = 16;

  // Framer Motion values for smooth animations
  const x = useMotionValue(0);
  const smoothX = useSpring(x, { damping: 30, stiffness: 300 });

  const sortedItems = [...items].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );

  const showNavigation = sortedItems.length > itemsPerView && itemsPerView > 0;
  const maxStartIndex = Math.max(0, sortedItems.length - itemsPerView);

  const updateItemsPerView = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      // Only account for padding (32px total)
      const availableWidth = containerWidth - 32;
      const itemWithGap = itemWidth + itemGap;
      const newItemsPerView = Math.floor(availableWidth / itemWithGap);
      const calculatedItems = Math.max(1, newItemsPerView);

      setItemsPerView(calculatedItems);
    }
  }, [itemWidth, itemGap]);

  useEffect(() => {
    updateItemsPerView();
    const resizeObserver = new ResizeObserver(updateItemsPerView);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [updateItemsPerView]);

  // Reset startIndex if it becomes invalid
  useEffect(() => {
    const newMaxIndex = Math.max(0, sortedItems.length - itemsPerView);
    if (startIndex > newMaxIndex && itemsPerView > 0) {
      const validIndex = Math.max(0, newMaxIndex);
      setStartIndex(validIndex);
      x.set(-validIndex * (itemWidth + itemGap));
    }
  }, [sortedItems.length, itemsPerView, startIndex, x]);

  const nextSlide = () => {
    if (startIndex < maxStartIndex && !isTransitioning) {
      setIsTransitioning(true);
      const newIndex = Math.min(startIndex + 1, maxStartIndex);
      setStartIndex(newIndex);
      x.set(-newIndex * (itemWidth + itemGap));
      setTimeout(() => setIsTransitioning(false), 400);
    }
  };

  const prevSlide = () => {
    if (startIndex > 0 && !isTransitioning) {
      setIsTransitioning(true);
      const newIndex = Math.max(startIndex - 1, 0);
      setStartIndex(newIndex);
      x.set(-newIndex * (itemWidth + itemGap));
      setTimeout(() => setIsTransitioning(false), 400);
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

  // Initialize motion value when component mounts
  useEffect(() => {
    x.set(-startIndex * (itemWidth + itemGap));
  }, [startIndex, x]);

  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex < maxStartIndex;

  return (
    <motion.div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Container with proper overflow handling */}
      <div className="overflow-hidden px-4" ref={containerRef}>
        <motion.div className="flex gap-4" style={{ x: smoothX }}>
          {sortedItems.map((item, index) => {
            const isActive = item._id === currentCategoryId;
            return (
              <motion.div
                key={`${item._id}-${index}`}
                className="shrink-0"
                style={{
                  width: `${itemWidth}px`,
                  minWidth: `${itemWidth}px`,
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                  ease: "easeOut",
                }}
              >
                <Link
                  href={getItemHref(item)}
                  className={`group/item block w-full rounded-xl border p-4 shadow-md items-center justify-center h-[120px] transition-all duration-300 hover:shadow-lg ${
                    isActive
                      ? "border-bondi-blue bg-bondi-blue/10 shadow-bondi-blue/20"
                      : "border-bondi-blue/40 hover:bg-bondi-blue/5 bg-white hover:border-bondi-blue/60"
                  }`}
                >
                  <div className="flex items-center gap-3 h-full w-full">
                    {/* Icon Section */}
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-gray-50/80 shadow-sm">
                      {item.icon ? (
                        <div className="relative size-full">
                          <Image
                            src={item.icon}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover/item:scale-110"
                            sizes="64px"
                          />
                        </div>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="size-6 text-gray-400 transition-colors group-hover/item:text-bondi-blue/70" />
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-col justify-center h-full min-w-0 flex-1">
                      <motion.h3
                        className={`line-clamp-2 text-sm font-semibold my-0 leading-tight transition-colors ${
                          isActive
                            ? "text-bondi-blue"
                            : "text-gray-800 group-hover/item:text-bondi-blue"
                        }`}
                        layout
                      >
                        {item.name}
                      </motion.h3>
                      <motion.div
                        className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Package className="size-3.5 shrink-0" />
                        <span className="truncate">
                          {item?.products?.length === 0 || !item?.products
                            ? "No products"
                            : item?.products?.length === 1
                              ? "1 Product"
                              : `${item?.products?.length} Products`}
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Navigation Buttons - Fixed positioning */}
      <AnimatePresence>
        {showNavigation && (
          <>
            {/* Left Navigation Button */}
            <motion.button
              disabled={!canGoPrev || isTransitioning}
              onClick={prevSlide}
              className={`absolute left-2 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/95 p-2.5 text-gray-700 shadow-lg backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-bondi-blue/50 ${
                canGoPrev ? "cursor-pointer" : "cursor-not-allowed"
              }`}
              aria-label="Previous items"
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: isHovered ? (canGoPrev ? 1 : 0.3) : 0.7,
                x: 0,
                scale: canGoPrev ? 1 : 0.9,
              }}
              whileHover={
                canGoPrev
                  ? {
                      scale: 1.05,
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
                    }
                  : {}
              }
              whileTap={canGoPrev ? { scale: 0.95 } : {}}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.svg
                className="size-5"
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={{ x: isTransitioning && canGoPrev ? [-2, 2, -2] : 0 }}
                transition={{ duration: 0.3 }}
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </motion.svg>
            </motion.button>

            {/* Right Navigation Button */}
            <motion.button
              disabled={!canGoNext || isTransitioning}
              onClick={nextSlide}
              className={`absolute right-2 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/95 p-2.5 text-gray-700 shadow-lg backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-bondi-blue/50 ${
                canGoNext ? "cursor-pointer" : "cursor-not-allowed"
              }`}
              aria-label="Next items"
              initial={{ opacity: 0, x: 20 }}
              animate={{
                opacity: isHovered ? (canGoNext ? 1 : 0.3) : 0.7,
                x: 0,
                scale: canGoNext ? 1 : 0.9,
              }}
              whileHover={
                canGoNext
                  ? {
                      scale: 1.05,
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
                    }
                  : {}
              }
              whileTap={canGoNext ? { scale: 0.95 } : {}}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.svg
                className="size-5"
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={{ x: isTransitioning && canGoNext ? [2, -2, 2] : 0 }}
                transition={{ duration: 0.3 }}
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </motion.svg>
            </motion.button>

            {/* Slide Indicators */}
            {maxStartIndex > 0 && (
              <motion.div
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {Array.from({ length: maxStartIndex + 1 }).map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      if (!isTransitioning) {
                        setIsTransitioning(true);
                        setStartIndex(index);
                        x.set(-index * (itemWidth + itemGap));
                        setTimeout(() => setIsTransitioning(false), 400);
                      }
                    }}
                    className={`size-2 rounded-full transition-all duration-200 ${
                      index === startIndex
                        ? "bg-bondi-blue"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{
                      scale: index === startIndex ? 1.1 : 1,
                      backgroundColor:
                        index === startIndex ? "#00a3b4" : "#d1d5db",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                ))}
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CategorySlider;
