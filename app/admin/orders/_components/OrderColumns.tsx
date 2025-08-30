'use client';

import { Badge } from '@/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Button } from '@/ui/button';
import {
  Eye,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
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

const ActionsCell = ({ order }: { order: OrderType }) => {
  const router = useRouter();

  return (
    <div className='flex items-center justify-end gap-2'>
      <Button
        variant='ghost'
        size='icon'
        onClick={() => router.push(`/admin/orders/${order.orderId}`)}
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
            onClick={() => router.push(`/admin/orders/${order.orderId}`)}
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
};

export const columns: ColumnDef<OrderType>[] = [
  {
    accessorKey: 'orderId',
    header: 'Order ID',
    cell: ({ row }) => (
      <Link
        href={`/admin/orders/${row.original.orderId}`}
        className='text-primary hover:underline'
      >
        {row.original.orderId}
      </Link>
    ),
  },
  {
    accessorKey: 'customerInfo.name',
    header: 'Customer',
    cell: ({ row }) => {
      const customerName = row.original.customerInfo?.name || 'N/A';
      return <span>{customerName}</span>;
    },
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
      const trackingHistory = row.original.trackingHistory || [];
      const latestTracking = trackingHistory[trackingHistory.length - 1];

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

      return (
        <div className='flex flex-col gap-1'>
          <Badge variant={badgeVariant}>{status}</Badge>
          {latestTracking && (
            <p className='text-xs text-muted-foreground max-w-[200px] truncate'>
              {latestTracking.notes}
            </p>
          )}
        </div>
      );
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
      const amount = row.original.products.map((p) => p.totalPrice);
      console.log(row.original.products.map((p) => p.totalPrice));
      return `${amount.map((p) => p.cny)} ¥ / ${amount.map((p) => p.usd)} $ / ${amount.map((p) => p.bdt)} ৳`;
    },
  },
  {
    accessorKey: 'shippingMethod',
    header: 'Shipping',
    cell: ({ row }) => {
      const method = row.original.shippingMethod;
      const delivery = row.original.deliveryType;
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
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='h-8 p-0 font-semibold'
        >
          Date
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className='ml-2 h-4 w-4' />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className='ml-2 h-4 w-4' />
          ) : (
            <ArrowUpDown className='ml-2 h-4 w-4' />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      return format(new Date(row.original.createdAt), 'MMM dd, yyyy');
    },
    sortingFn: 'datetime',
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionsCell order={row.original} />,
  },
];
