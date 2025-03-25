import { use } from 'react';
import CategorySlider from '../categories/_components/CategorySlider';
async function fetchCategories() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/categories`,
      {
        next: { revalidate: 60 }, // Cache for 1 minute
        cache: 'no-store', // Disable Next.js caching if needed
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    return response.json();
  } catch (error) {
    console.error('Categories fetch error:', error);
    return [];
  }
}
export default function Categories() {
  const categories = use(fetchCategories());
  return (
    <div className='mx-auto px-5 py-8 '>
      <h1 className='py-4 text-center text-heading1-bold font-bold text-bondi-blue'>
        Categories
      </h1>
      <CategorySlider items={categories} />
    </div>
  );
}
