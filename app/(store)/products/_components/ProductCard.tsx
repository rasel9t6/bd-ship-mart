'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import { ProductType, UserType } from '@/types/next-utils';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';
import { useCart } from '@/hooks/useCart';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import HeartFavorite from './HeartFavorite';

interface ProductCardProps {
  product: ProductType;
  className?: string;
  updateSignedInUser?: (user: UserType) => void;
}

export default function ProductCard({
  product,
  className,
  updateSignedInUser,
}: ProductCardProps) {
  const { addProduct, products } = useCart();
  const { data: session } = useSession();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { _id, title, description, media, price, slug, tags } = product;

  const mainImage = media?.[0]?.url || '/placeholder-product.webp';
  const secondaryImage = media?.[1]?.url || mainImage;
  const displayPrice = price?.bdt || 0;

  const isWishlisted = session?.user?.wishlist?.includes(_id.toString());

  const handleAddToCart = async () => {
    if (!_id) return;

    const isAlreadyInCart = products.some((p) => p.product === _id.toString());

    if (isAlreadyInCart) {
      toast('Product is already in the cart.', {
        icon: '⚠️',
      });
      return;
    }

    setIsLoading(true);
    try {
      addProduct({
        product: _id.toString(),
        variants: [
          {
            color: 'default',
            size: 'default',
            quantity: 1,
            unitPrice: {
              bdt: displayPrice,
              usd: price?.usd || 0,
              cny: price?.cny || 0,
            },
            totalPrice: {
              bdt: displayPrice,
              usd: price?.usd || 0,
              cny: price?.cny || 0,
            },
          },
        ],
      });
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (slug) {
      window.open(`/products/${slug}`, '_blank');
    }
  };

  return (
    <div
      className={cn(
        'group flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 w-full',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className='relative aspect-square overflow-hidden bg-gray-100'>
        <Link href={`/products/${slug}`}>
          <Image
            src={isHovered ? secondaryImage : mainImage}
            alt={title || 'Product'}
            fill
            className='object-cover transition-transform duration-300 group-hover:scale-105'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw'
          />
        </Link>

        {/* Overlay with quick actions */}
        <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300'>
          <div className='absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
            <Button
              size='icon'
              variant='secondary'
              className='h-9 w-9 rounded-full bg-white/90 hover:bg-bondi-blue text-gray-700 hover:text-white'
              onClick={handleQuickView}
            >
              <Eye className='h-5 w-5' />
            </Button>
            <HeartFavorite
              product={product}
              initialIsWishlist={isWishlisted}
              updateSignedInUser={updateSignedInUser}
            />
          </div>
        </div>

        {/* Category Badge */}
        {product.categories?.[0] && (
          <div className='absolute top-2 left-2'>
            <span className='px-2 py-1 bg-bondi-blue text-white text-xs font-medium rounded'>
              {product.categories[0].name}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className='p-3 flex flex-col flex-grow'>
        <Link href={`/products/${slug}`}>
          <h3 className='text-base font-semibold text-gray-900 group-hover:text-bondi-blue transition-colors duration-200 line-clamp-1'>
            {title}
          </h3>
        </Link>

        <div className='mt-1 h-6'>
          {description && (
            <p className='text-sm text-gray-600 line-clamp-1'>{description}</p>
          )}
        </div>

        {/* Tags */}
        <div className='mt-2 min-h-[24px]'>
          {tags && tags.length > 0 && (
            <div className='flex flex-wrap gap-1'>
              {tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded'
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className='flex-grow' />

        {/* Price */}
        <div className='mt-2 flex items-center justify-between'>
          <span className='text-lg font-bold text-gray-900'>
            ৳{displayPrice.toLocaleString()}
          </span>
          <Button
            onClick={handleAddToCart}
            disabled={isLoading}
            size='sm'
            className='w-auto'
          >
            <ShoppingCart className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  );
}
