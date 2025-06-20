'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { ProductType } from '@/types/next-utils';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';
import { useCart } from '@/hooks/useCart';

interface ProductCardProps {
  product: ProductType;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const { addProduct } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { _id, title, description, media, price, slug, tags } = product;

  const mainImage = media?.[0]?.url || '/placeholder-product.jpg';
  const secondaryImage = media?.[1]?.url || mainImage;
  const displayPrice = price?.bdt || 0;

  const handleAddToCart = async () => {
    if (!_id) return;

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
    } catch (error) {
      console.error('Error adding to cart:', error);
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
        'group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className='relative aspect-[4/3] overflow-hidden bg-gray-100'>
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
          <div className='absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
            <Button
              size='sm'
              variant='secondary'
              className='h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white'
              onClick={handleQuickView}
            >
              <Eye className='h-4 w-4' />
            </Button>
            <Button
              size='sm'
              variant='secondary'
              className='h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white'
            >
              <Heart className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Category Badge */}
        {product.categories?.[0] && (
          <div className='absolute top-3 left-3'>
            <span className='px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded'>
              {product.categories[0].name}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className='p-4'>
        <Link href={`/products/${slug}`}>
          <h3 className='text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1'>
            {title}
          </h3>
        </Link>

        {description && (
          <p className='mt-2 text-sm text-gray-600 line-clamp-2'>
            {description}
          </p>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className='mt-2 flex flex-wrap gap-1'>
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

        {/* Price */}
        <div className='mt-3 flex items-center gap-2'>
          <span className='text-xl font-bold text-gray-900'>
            ৳{displayPrice.toLocaleString()}
          </span>
          {price?.usd && (
            <span className='text-sm text-gray-500'>
              ${price.usd.toFixed(2)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className='mt-4 flex gap-2'>
          <Button
            onClick={handleAddToCart}
            disabled={isLoading}
            className='flex-1'
            size='sm'
          >
            <ShoppingCart className='h-4 w-4 mr-2' />
            {isLoading ? 'Adding...' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
}
