import { ProductType } from '@/types/next-utils';
import ProductCard from '../products/_components/ProductCard';
import { getProducts } from '@/lib/actions/actions';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default async function ProductList() {
  // Fetch only featured products with optimized query
  const products = await getProducts({ limit: 12 });

  if (!products || products.length === 0) {
    return (
      <div className='container mx-auto flex flex-col items-center gap-4 px-2 sm:px-4 py-8'>
        <div className='flex items-center justify-between w-full max-w-7xl mb-4'>
          <h2 className='text-heading1-bold bg-gradient-to-r from-bondi-blue to-bondi-blue/80 bg-clip-text text-transparent'>
            Featured Products
          </h2>
          <Link
            href='/products'
            className='flex items-center gap-2 text-bondi-blue hover:text-bondi-blue/80 transition-colors duration-200 font-medium'
          >
            View All Products
            <ArrowRight className='h-4 w-4' />
          </Link>
        </div>
        <div className='rounded-xl bg-white/50 p-8 shadow-sm backdrop-blur-sm'>
          <p className='text-body-bold text-gray-600'>
            No featured products found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto flex flex-col items-center gap-6 sm:gap-8 px-2 sm:px-4 py-8'>
      {/* Header with title and "View All" link */}
      <div className='flex items-center justify-between w-full max-w-7xl'>
        <h2 className='text-heading1-bold bg-gradient-to-r from-bondi-blue to-bondi-blue/80 bg-clip-text text-transparent'>
          Featured Products
        </h2>
        <Link
          href='/products'
          className='group flex items-center gap-2 px-4 py-2 bg-bondi-blue/10 hover:bg-bondi-blue/20 text-bondi-blue hover:text-bondi-blue/80 transition-all duration-200 rounded-lg font-medium text-sm sm:text-base'
        >
          View All Products
          <ArrowRight className='h-4 w-4 group-hover:translate-x-1 transition-transform duration-200' />
        </Link>
      </div>

      {/* Products Grid */}
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full max-w-7xl'>
        {products.map((product: ProductType) => (
          <div
            key={product._id.toString()}
            className='w-full max-w-[250px] mx-auto'
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Additional CTA section */}
      {/* <div className='mt-6 text-center'>
        <p className='text-gray-600 mb-4'>
          Discover more amazing products in our complete collection
        </p>
        <Link
          href='/products'
          className='inline-flex items-center gap-2 px-6 py-3 bg-bondi-blue hover:bg-bondi-blue/90 text-white rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg'
        >
          Explore All Products
          <ArrowRight className='h-5 w-5' />
        </Link>
      </div> */}
    </div>
  );
}
