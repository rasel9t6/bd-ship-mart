import React from "react";
import Image from "next/image";
import { ProductType } from "@/types/next-utils";

interface CategoryHeroProps {
  title: string;
  description: string;
  thumbnail: string;
  products: ProductType[];
}

export default function CategoryHero({
  title,
  description,
  thumbnail,
  products,
}: CategoryHeroProps) {
  return (
    <>
      {/* Hero Section */}
      <div className="relative h-[40vh] w-full sm:h-[50vh] md:h-[60vh]">
        <Image
          src={thumbnail}
          fill
          alt={title}
          className="rounded-lg object-cover"
          priority
        />
        <div className="absolute inset-0 rounded-lg bg-black/40" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6 md:p-8">
          <div className="mx-auto max-w-6xl">
            <h1 className="mb-2 text-2xl font-bold sm:mb-4 sm:text-3xl md:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="line-clamp-3 max-w-2xl text-base opacity-90 sm:text-lg">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Collection Stats */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Total Products Card */}
          <div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative">
              <p className="mb-2 text-sm font-medium text-gray-500">
                Total Products
              </p>
              <p className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {products?.length || 0}
              </p>
            </div>
          </div>

          {/* Price Range Card */}
          <div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative">
              <p className="mb-2 text-sm font-medium text-gray-500">
                Price Range
              </p>
              {products && products.length > 0 ? (
                (() => {
                  const validPrices = products
                    .map((p: ProductType) => p?.price?.bdt)
                    .filter((price) => typeof price === "number");

                  return validPrices.length > 0 ? (
                    <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
                      <span className="text-primary">
                        ৳{Math.min(...validPrices).toLocaleString()}
                      </span>
                      <span className="mx-2 text-gray-400">-</span>
                      <span className="text-primary">
                        ৳{Math.max(...validPrices).toLocaleString()}
                      </span>
                    </p>
                  ) : (
                    <p className="text-xl font-medium text-gray-500">
                      No price available
                    </p>
                  );
                })()
              ) : (
                <p className="text-xl font-medium text-gray-500">
                  No price available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
