import { DialogHeader, DialogTitle, DialogDescription } from '@/ui/dialog';
import { Badge } from '@/ui/badge';
import { Progress } from '@/ui/progress';

interface OrderModalHeaderProps {
  userName: string | undefined;
  formCompletion: number;
}

export const OrderModalHeader = ({
  userName,
  formCompletion,
}: OrderModalHeaderProps) => {
  return (
    <DialogHeader className='p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b'>
      <div className='flex justify-between items-center'>
        <div>
          <DialogTitle className='text-2xl font-bold text-blue-800'>
            Create New Order
          </DialogTitle>
          <DialogDescription className='text-blue-600 mt-1'>
            Complete the form to create a new order for{' '}
            {userName || 'this customer'}
          </DialogDescription>
        </div>
        <Badge
          variant='outline'
          className='bg-blue-100 text-blue-800 px-3 py-1 font-medium'
        >
          {formCompletion}% Complete
        </Badge>
      </div>
      <Progress
        value={formCompletion}
        className='h-1 mt-2'
      />
    </DialogHeader>
  );
};
