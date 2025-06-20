"use client";

import { useSession } from "next-auth/react";
import { FaHeart } from "react-icons/fa6";
import React, { useState } from "react";
import { ProductInfoType, ProductType, UserType } from "@/types/next-utils";
import toast from "react-hot-toast";

interface HeartFavoriteProps {
  product: ProductInfoType | ProductType;
  updateSignedInUser?: (user: UserType) => void;
  initialIsWishlist?: boolean;
}

export default function HeartFavorite({
  product,
  updateSignedInUser,
  initialIsWishlist = false,
}: HeartFavoriteProps) {
  const { data: session } = useSession();
  const [isWishlist, setIsWishlist] = useState(initialIsWishlist);

  const handleWishlist = async () => {
    if (!session?.user) {
      toast.error("Please sign in to add to wishlist");
      return;
    }

    try {
      const res = await fetch("/api/users/wishlist", {
        method: "POST",
        body: JSON.stringify({
          productId: product._id,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update wishlist");
      }

      const data = await res.json();
      setIsWishlist(!isWishlist);
      if (updateSignedInUser) {
        updateSignedInUser(data);
      }
      toast.success(isWishlist ? "Removed from wishlist" : "Added to wishlist");
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  return (
    <button
      onClick={handleWishlist}
      className="h-9 w-9 rounded-full bg-white/90 text-gray-700 shadow-sm hover:bg-bondi-blue hover:text-white flex items-center justify-center"
    >
      <FaHeart
        className={`h-5 w-5 transition-colors ${
          isWishlist ? "text-red-500 fill-red-500" : ""
        }`}
      />
    </button>
  );
}
