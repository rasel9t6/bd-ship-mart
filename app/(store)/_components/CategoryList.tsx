import { getCategories } from '@/lib/actions/actions';
import CategorySlider from '../categories/_components/CategorySlider';

export default async function Categories() {
  const categories = await getCategories();

  return (
    <div className='container mx-auto flex flex-col items-center gap-4 sm:gap-6 px-2 sm:px-4 py-6'>
      <h2 className='text-heading1-bold text-bondi-blue'>Shop by Categories</h2>
      <div className='w-full bg-white rounded-lg p-4 shadow-sm'>
        <CategorySlider items={categories} />
      </div>
    </div>
  );
}
