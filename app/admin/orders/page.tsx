import { getOrders } from '@/lib/actions/actions';
import DataTable from '@/ui/custom/DataTable';
import { columns } from './_components/OrderColumns';

export default async function OrdersPage() {
  const orders = (await getOrders()) || [];
  console.log(orders);
  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <div className='flex items-center justify-between space-y-2'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>Orders</h2>
            <p className='text-sm text-muted-foreground'>
              Showing newest orders first • Click Date column to sort
            </p>
          </div>
          <div className='flex items-center space-x-2'></div>
        </div>
        <DataTable
          columns={columns}
          data={orders}
          searchKey='orderId'
          searchPlaceholder='Search by order ID...'
          defaultSort={[{ id: 'createdAt', desc: true }]}
        />
      </div>
    </div>
  );
}
