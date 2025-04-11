'use client';

import { CustomerType } from '@/types/next-utils';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<CustomerType>[] = [
  {
    accessorKey: 'customerId',
    header: 'Customer ID',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => row.original.phone || 'N/A',
  },
  {
    accessorKey: 'address',
    header: 'Address',
    cell: ({ row }) => {
      const address = row.original.address;
      if (!address)
        return <span className='text-gray-500'>No address provided</span>;

      const addressParts = [
        address.street,
        [address.city, address.state, address.postalCode]
          .filter(Boolean)
          .join(', '),
        address.country,
      ].filter(Boolean);

      return addressParts.length > 0 ? (
        <div className='space-y-1'>
          {addressParts.map((part, index) => (
            <div key={index}>{part}</div>
          ))}
        </div>
      ) : (
        <span className='text-gray-500'>No address provided</span>
      );
    },
  },
  {
    accessorKey: 'orders',
    header: 'Orders',
    cell: ({ row }) => {
      const orders = row.original.orders;
      const orderCount = orders?.length ?? 0;

      return orderCount > 0 ? (
        <div>
          <span className='font-bold'>{orderCount}</span> orders
        </div>
      ) : (
        <span className='text-gray-500'>No orders</span>
      );
    },
  },
];
