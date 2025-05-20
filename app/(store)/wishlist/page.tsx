"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { HeartIcon, ShoppingCartIcon, TrashIcon } from "lucide-react";

// Define the Product type based on your data model
interface Product {
  _id: string;
  slug: string;
  name: string;
  price: {
    cny: number;
    usd: number;
    bdt: number;
  };
  media: {
    url: string;
    type: "image" | "video";
  }[];
  description: string;
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/users/wishlist", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Redirect to login if unauthorized
            router.push("/login");
            return;
          }
          throw new Error(`Error ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        setWishlist(data.wishlist || []);
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
        setError("Failed to load wishlist. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [router]);

  const removeFromWishlist = async (productId: string) => {
    try {
      const response = await fetch("/api/users/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      // Update local state to remove the product
      setWishlist((prev) =>
        prev.filter((product) => product._id !== productId),
      );
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
      setError("Failed to remove item. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-4 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center bg-red-50 p-6 rounded-lg max-w-md">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-bondi-blue text-white rounded hover:bg-bondi-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto bg-background p-4 min-h-screen flex flex-col items-center justify-center">
        <div className="text-center max-w-lg">
          <HeartIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-2">Your wishlist is empty</h1>
          <p className="text-gray-600 mb-6">
            Browse our products and add items to your wishlist to save them for
            later.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-bondi-blue text-white rounded-lg hover:bg-bondi-blue-600"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-background">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <HeartIcon className="w-8 h-8 mr-2 text-bondi-blue" />
        My Wishlist
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {wishlist.map((product) => (
          <div
            key={product._id}
            className="border border-bondi-blue-100 rounded-lg overflow-hidden shadow-md bg-white hover:border-bondi-blue-200 transition-colors h-full flex flex-col"
          >
            <div className="relative aspect-[4/3] bg-gray-100">
              {product.media && product.media.length > 0 ? (
                <Image
                  src={product.media[0].url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
            </div>

            <div className="p-4 flex flex-col flex-grow">
              <Link href={`/products/${product.slug}`}>
                <h2 className="text-lg font-semibold mb-2 hover:text-bondi-blue line-clamp-2">
                  {product.name}
                </h2>
              </Link>
              <p className="text-gray-700 mb-2 line-clamp-2 text-sm">
                {product.description}
              </p>
              <p className="text-lg font-bold text-bondi-blue mt-auto mb-4">
                ৳{product.price.bdt.toFixed(2)}
              </p>

              <div className="mt-auto flex justify-between gap-2">
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="flex items-center px-3 py-2 bg-danger-50 text-danger-600 rounded hover:bg-danger-100 flex-1 justify-center"
                >
                  <TrashIcon className="w-4 h-4 mr-1" />
                  Remove
                </button>

                <Link
                  href={`/products/${product.slug}`}
                  className="flex items-center px-3 py-2 bg-bondi-blue text-white rounded hover:bg-bondi-blue-600 flex-1 justify-center"
                >
                  <ShoppingCartIcon className="w-4 h-4 mr-1" />
                  Buy Now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
