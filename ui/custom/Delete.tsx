'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaTrash } from 'react-icons/fa6';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../alert-dialog';
import { useRouter } from 'next/navigation';

export default function Delete({ id, item }: { id: string; item: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  async function onDelete() {
    try {
      setLoading(true);
      const itemType = item === 'product' ? 'products' : 'categories';
      const res = await fetch(`/api/${itemType}/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setLoading(false);
        toast.success(`${item} deleted`);
        router.refresh();
      } else {
        console.error(`${item} deletion failed`, await res.text());
        toast.error(`${item} deletion failed.Please try again.`);
      }
    } catch (error) {
      console.error(`[${item}]_DELETE`, error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <span className='inline-flex h-10 items-center justify-center rounded-md bg-danger px-3 py-2 text-white'>
          <FaTrash className='size-4' />
        </span>
      </AlertDialogTrigger>
      <AlertDialogContent className='bg-white text-gray-1'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-danger'>
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {`This action cannot be undone. This will permanently delete your
            ${item}.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className='bg-danger text-white'
            onClick={onDelete}
          >
            {loading ? 'Deleting...' : `Delete`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
