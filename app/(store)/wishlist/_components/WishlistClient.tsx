'use client';

import { ProductType } from '@/types/next-utils';
import ProductCard from '../../products/_components/ProductCard';
import { useState } from 'react';

interface WishlistClientProps {
  products: ProductType[];
}

export default function WishlistClient({ products }: WishlistClientProps) {
  const [wishlistProducts, setWishlistProducts] = useState(products);

  const handleUpdateUser = (updatedUser: any) => {
    // Update the wishlist products when a product is removed
    setWishlistProducts((prevProducts) =>
      prevProducts.filter((product) =>
        updatedUser.wishlist.includes(product._id)
      )
    );
  };

  if (!wishlistProducts.length) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-2xl font-bold mb-6'>Your Wishlist</h1>
        <div className='rounded-lg bg-white p-6 shadow-sm'>
          <p className='text-body-bold text-gray-600'>
            Your wishlist is empty.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold mb-6'>Your Wishlist</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {wishlistProducts.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            updateSignedInUser={handleUpdateUser}
          />
        ))}
      </div>
    </div>
  );
}
