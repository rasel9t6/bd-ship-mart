'use client';

import { Badge } from '@/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Button } from '@/ui/button';
import { Eye, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

import Link from 'next/link';
import { OrderType } from '@/types/next-utils';

export const columns: ColumnDef<OrderType>[] = [
  {
    accessorKey: 'orderId',
    header: 'Order ID',
    cell: ({ row }) => (
      <Link
        href={`/orders/${row.original.orderId}`}
        className='text-primary hover:underline'
      >
        {row.original.orderId}
      </Link>
    ),
  },
  {
    accessorKey: 'customerInfo.name',
    header: 'Customer',
  },
  {
    accessorKey: 'products',
    header: 'Products',
    cell: ({ row }) => {
      const products = row.original.products;
      const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);
      return `${totalItems} items`;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      let badgeVariant:
        | 'default'
        | 'secondary'
        | 'destructive'
        | 'outline'
        | 'success'
        | 'warning' = 'default';

      switch (status) {
        case 'pending':
          badgeVariant = 'warning';
          break;
        case 'processing':
          badgeVariant = 'secondary';
          break;
        case 'shipped':
          badgeVariant = 'secondary';
          break;
        case 'delivered':
          badgeVariant = 'success';
          break;
        case 'canceled':
          badgeVariant = 'destructive';
          break;
        default:
          badgeVariant = 'default';
      }

      return <Badge variant={badgeVariant}>{status}</Badge>;
    },
  },
  {
    accessorKey: 'paymentDetails.status',
    header: 'Payment',
    cell: ({ row }) => {
      const status = row.original.paymentDetails.status;
      return (
        <Badge
          variant={
            status === 'paid'
              ? 'success'
              : status === 'pending'
                ? 'warning'
                : 'destructive'
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'totalAmount',
    header: 'Total Amount',
    cell: ({ row }) => {
      const amount = row.original.totalAmount;
      return `${amount.cny} ¥ / ${amount.usd} $ / ${amount.bdt} ৳`;
    },
  },
  {
    accessorKey: 'shippingMethod',
    header: 'Shipping',
    cell: ({ row }) => {
      const method = row.getValue('shippingMethod') as string;
      const delivery = row.getValue('deliveryType') as string;
      return (
        <div className='flex flex-col'>
          <span className='capitalize'>{method}</span>
          <span className='text-xs capitalize text-muted-foreground'>
            {delivery}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => {
      return format(new Date(row.original.createdAt), 'MMM dd, yyyy');
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const order = row.original;
      const router = useRouter();

      return (
        <div className='flex items-center justify-end gap-2'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => router.push(`/admin/orders/${order._id}`)}
          >
            <Eye className='h-4 w-4' />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
              >
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => router.push(`/admin/orders/${order._id}`)}
              >
                View details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(order.orderId)}
              >
                Copy order ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
