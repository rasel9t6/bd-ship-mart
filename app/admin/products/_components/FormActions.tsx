import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/ui/button';

interface FormActionsProps {
  loading: boolean;
  isEdit: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({ loading, isEdit }) => {
  const router = useRouter();

  return (
    <div className='flex items-center justify-end space-x-4'>
      <Button
        type='button'
        variant='outline'
        onClick={() => router.push('/admin/products')}
        disabled={loading}
      >
        Cancel
      </Button>
      <Button
        type='submit'
        disabled={loading}
      >
        {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
      </Button>
    </div>
  );
};

export default FormActions;
