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
      className="group flex h-full flex-col gap-2 rounded-xl border border-gray-200/80 bg-white/95 p-2.5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-bondi-blue/20 hover:bg-white"
    >
      {/* 🖼 Product Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-50">
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
      <div className="flex flex-col gap-1">
        <p className="line-clamp-2 text-sm font-medium text-gray-800 group-hover:text-bondi-blue">
          {product.title}
        </p>
        <p className="text-xs text-gray-500">
          {product.categories?.[0]?.name ||
            (product.subcategories && product.subcategories.length > 0
              ? product.subcategories[0].name
              : "Uncategorized")}
        </p>
      </div>

      {/* 💰 Price & Wishlist */}
      <div className="mt-auto flex items-center justify-between pt-1">
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
