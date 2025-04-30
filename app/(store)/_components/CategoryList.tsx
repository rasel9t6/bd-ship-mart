import { getCategories } from '@/lib/actions/actions';
import CategorySlider from '../categories/_components/CategorySlider';

export default async function Categories() {
  const categories = await getCategories();

  return (
    <div className='container mx-auto px-4 sm:px-5 py-8'>
      <h2 className='mb-6 text-center text-heading1-bold text-bondi-blue'>
        Shop by Categories
      </h2>
      <div className='bg-white rounded-lg p-4 shadow-sm'>
        <CategorySlider items={categories} />
      </div>
    </div>
  );
}
