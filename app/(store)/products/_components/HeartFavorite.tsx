'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaHeart, FaRegHeart } from 'react-icons/fa6';
import React, { useState, useEffect, useCallback } from 'react';
import { ProductInfoType, ProductType, UserType } from '@/types/next-utils';
import toast from 'react-hot-toast';

interface HeartFavoriteProps {
  product: ProductInfoType | ProductType;

  updateSignedInUser?: (user: UserType) => void;
}

export default function HeartFavorite({
  product,
  updateSignedInUser,
}: HeartFavoriteProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isWishlist, setIsWishlist] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkWishlist = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      const isInWishlist = data.wishlist.includes(product._id);
      setIsWishlist(isInWishlist);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to check wishlist status');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      checkWishlist();
    }
  }, [session]);

  const handleWishlist = async () => {
    try {
      const res = await fetch('/api/users/wishlist', {
        method: 'POST',
        body: JSON.stringify({
          productId: product._id,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update wishlist');
      }

      const data = await res.json();
      setIsWishlist(!isWishlist);
      updateSignedInUser(data);
      toast.success(isWishlist ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <div className='absolute top-2 right-2'>
      {loading ? (
        <Loader />
      ) : (
        <button
          onClick={handleWishlist}
          className='p-2 rounded-full bg-white shadow-md hover:bg-gray-100'
        >
          <FaHeart
            className={`w-6 h-6 ${
              isWishlist ? 'text-red-500 fill-red-500' : 'text-gray-500'
            }`}
          />
        </button>
      )}
    </div>
  );
}
