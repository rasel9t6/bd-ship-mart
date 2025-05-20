"use client";

import Image from "next/image";
import Link from "next/link";
import HeartFavorite from "./HeartFavorite";
import { ProductType, UserType } from "@/types/next-utils";
import { useSession } from "next-auth/react";

interface ProductCardProps {
  product: ProductType;
  updateSignedInUser?: (user: UserType) => void;
  isInWishlist?: boolean;
}

export default function ProductCard({
  product,
  updateSignedInUser,
  isInWishlist = false,
}: ProductCardProps) {
  const { data: session } = useSession();

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col gap-1.5 rounded-lg border border-gray-200 bg-white p-2 shadow-sm transition-all duration-300 hover:shadow-lg"
    >
      {/* 🖼 Product Image */}
      <div className="relative h-32 w-full overflow-hidden rounded-lg">
        <Image
          src={product?.media?.[0]?.url || "/not-found.gif"}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
          priority
        />
      </div>

      {/* 📌 Product Info */}
      <div className="flex flex-col gap-0.5">
        <p className="truncate text-sm font-medium text-gray-800">
          {product.title}
        </p>
        <p className="text-xs text-gray-500">
          {product.category?.name ||
            product.subcategories?.[0]?.name ||
            "No Category"}
        </p>
      </div>

      {/* 💰 Price & Wishlist */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-blaze-orange">
          ৳{product.price?.bdt}
        </p>
        {session?.user && (
          <div onClick={handleWishlistClick}>
            <HeartFavorite
              product={product}
              updateSignedInUser={updateSignedInUser}
              initialIsWishlist={isInWishlist}
            />
          </div>
        )}
      </div>
    </Link>
  );
}
