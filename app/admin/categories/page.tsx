import DataTable from '@/ui/custom/DataTable';
import { Separator } from '@radix-ui/react-separator';
import Link from 'next/link';
import { FaPlus } from 'react-icons/fa6';
import { columns } from './_components/CategoryColumns';

// Prevent static generation
export const dynamic = 'force-dynamic';

const url = process.env.NEXT_PUBLIC_API_URL;
if (!url) throw new Error('API URL Not Found');

export default async function CategoriesPage() {
  try {
    const res = await fetch(`${url}/api/categories`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch categories: ${res.statusText}`);
    }

    const categories = await res.json();

    return (
      <div className='px-10 py-5'>
        <div className='flex items-center justify-between'>
          <p className='text-heading2-bold'>Categories</p>
          <Link
            className='flex items-center rounded-lg bg-primary p-3 text-body-semibold text-white'
            href='/admin/categories/new'
          >
            <FaPlus className='mr-2 size-4' />
            Create Categories
          </Link>
        </div>
        <Separator className='my-4 bg-gray-1' />
        <DataTable
          columns={columns}
          data={categories || []}
          searchKey='title'
        />
      </div>
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    return (
      <div className='px-10 py-5'>
        <div className='flex items-center justify-between'>
          <p className='text-heading2-bold'>Categories</p>
          <Link
            className='flex items-center rounded-lg bg-primary p-3 text-body-semibold '
            href='/admin/categories/new'
          >
            <FaPlus className='mr-2 size-4' />
            Create Categories
          </Link>
        </div>
        <Separator className='my-4 bg-bondi-blue' />
        <div className='text-red-500'>
          Error loading categories. Please try again later.
        </div>
      </div>
    );
  }
}
