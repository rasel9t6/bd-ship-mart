import { ProductType } from '@/types/next-utils';
import ProductCard from '../products/_components/ProductCard';
import { getProducts } from '@/lib/actions/actions';

export default async function ProductList() {
  const products = await getProducts({ limit: 20 });
  if (!products || products.length === 0) {
    return (
      <div className='container mx-auto flex flex-col items-center gap-4 px-2 sm:px-4 py-8'>
        <h2 className='text-heading1-bold bg-gradient-to-r from-bondi-blue to-bondi-blue/80 bg-clip-text text-transparent'>
          Featured Products
        </h2>
        <div className='rounded-xl bg-white/50 p-8 shadow-sm backdrop-blur-sm'>
          <p className='text-body-bold text-gray-600'>No products found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto flex flex-col items-center gap-6 sm:gap-8 px-2 sm:px-4 py-8'>
      <h2 className='text-heading1-bold bg-gradient-to-r from-bondi-blue to-bondi-blue/80 bg-clip-text text-transparent'>
        Featured Products
      </h2>
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
    </div>
  );
}
