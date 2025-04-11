'use client';

import { useSession } from 'next-auth/react';
import { FaHeart } from 'react-icons/fa6';
import React, { useState, useEffect, useCallback } from 'react';
import { ProductInfoType, ProductType, UserType } from '@/types/next-utils';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface HeartFavoriteProps {
  product: ProductInfoType | ProductType;
  updateSignedInUser?: (user: UserType) => void;
}

export default function HeartFavorite({
  product,
  updateSignedInUser,
}: HeartFavoriteProps) {
  const { data: session } = useSession();
  const [isWishlist, setIsWishlist] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkWishlist = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      const isInWishlist = data.wishlist.includes(product._id);
      setIsWishlist(isInWishlist);
      setLoading(false);
    } catch (err) {
      console.error('Error checking wishlist:', err);
      toast.error('Failed to check wishlist status');
      setLoading(false);
    }
  }, [product._id]);

  useEffect(() => {
    if (session?.user) {
      checkWishlist();
    }
  }, [session, checkWishlist]);

  const handleWishlist = async () => {
    if (!session?.user) {
      toast.error('Please sign in to add to wishlist');
      return;
    }

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
      if (updateSignedInUser) {
        updateSignedInUser(data);
      }
      toast.success(isWishlist ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (err) {
      console.error('Error updating wishlist:', err);
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <div className='absolute top-2 right-2'>
      {loading ? (
        <Loader2 className='w-6 h-6 animate-spin text-gray-500' />
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
