import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/card';
import { Order } from './types';
import { formatCurrency } from './utils';

interface PaymentTransactionsProps {
  order: Order;
}

const PaymentTransactions: React.FC<PaymentTransactionsProps> = ({ order }) => {
  if (order.paymentDetails.transactions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className='text-right'>Amount</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.paymentDetails.transactions.map((transaction, index) => (
              <TableRow key={index}>
                <TableCell className='font-medium'>
                  {transaction.transactionId}
                </TableCell>
                <TableCell>
                  {format(new Date(transaction.paymentDate), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(
                    transaction.amount[
                      order.paymentCurrency.toLowerCase() as keyof typeof transaction.amount
                    ],
                    order.paymentCurrency
                  )}
                </TableCell>
                <TableCell>{transaction.notes}</TableCell>
                <TableCell>
                  {transaction.receiptUrl && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() =>
                        window.open(transaction.receiptUrl, '_blank')
                      }
                    >
                      View Receipt
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PaymentTransactions;
