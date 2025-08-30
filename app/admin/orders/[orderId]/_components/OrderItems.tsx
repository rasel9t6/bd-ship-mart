import React from 'react';
import Image from 'next/image';
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
import {
  formatCurrency,
  calculateSubTotal,
  calculateTotalAmount,
  getProductInfo,
} from './utils';

interface OrderItemsProps {
  order: Order;
}

const OrderItems: React.FC<OrderItemsProps> = ({ order }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Items</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU / Color / Size</TableHead>
              <TableHead className='text-right'>
                Price ({order.paymentCurrency})
              </TableHead>
              <TableHead className='text-right'>Quantity</TableHead>
              <TableHead className='text-right'>
                Total ({order.paymentCurrency})
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.products.map((item, index) => (
              <TableRow key={index}>
                <TableCell className='font-medium'>
                  {(() => {
                    console.log('Raw product item:', item);
                    console.log('Raw product field:', item.product);
                    const productInfo = getProductInfo(item.product);
                    console.log('Processed product info:', productInfo);
                    const displayName =
                      productInfo.name || productInfo.title || 'Product';
                    console.log('Final display name:', displayName);
                    return displayName;
                  })()}
                </TableCell>
                <TableCell>
                  {(() => {
                    const productInfo = getProductInfo(item.product);
                    return productInfo.sku && <div>SKU: {productInfo.sku}</div>;
                  })()}
                  {item.color && (
                    <div>
                      {Array.isArray(item.color) &&
                        item.color[0] &&
                        item.color[0].startsWith('http') && (
                          <Image
                            src={item.color[0]}
                            alt='Color variant'
                            width={50}
                            height={50}
                            className='mt-1 rounded border'
                          />
                        )}
                    </div>
                  )}
                  {item.size && (
                    <div>
                      Size:{' '}
                      {Array.isArray(item.size)
                        ? item.size.join(', ')
                        : item.size}
                    </div>
                  )}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(
                    item.unitPrice?.[
                      order.paymentCurrency.toLowerCase() as keyof typeof item.unitPrice
                    ] ?? 0,
                    order.paymentCurrency
                  )}
                </TableCell>
                <TableCell className='text-right'>{item.quantity}</TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(
                    item.totalPrice?.[
                      order.paymentCurrency.toLowerCase() as keyof typeof item.totalPrice
                    ] ?? 0,
                    order.paymentCurrency
                  )}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell
                colSpan={4}
                className='text-right font-medium'
              >
                Subtotal
              </TableCell>
              <TableCell className='text-right'>
                {formatCurrency(
                  calculateSubTotal(order, order.paymentCurrency),
                  order.paymentCurrency
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                colSpan={4}
                className='text-right font-medium'
              >
                Shipping Fee
              </TableCell>
              <TableCell className='text-right'>
                {formatCurrency(
                  order.shippingRate?.[
                    order.paymentCurrency.toLowerCase() as keyof typeof order.shippingRate
                  ] ?? 0,
                  order.paymentCurrency
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                colSpan={4}
                className='text-right font-medium'
              >
                Discount
              </TableCell>
              <TableCell className='text-right'>
                {formatCurrency(
                  order.totalDiscount?.[
                    order.paymentCurrency.toLowerCase() as keyof typeof order.totalDiscount
                  ] ?? 0,
                  order.paymentCurrency
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                colSpan={4}
                className='text-right font-medium'
              >
                Total
              </TableCell>
              <TableCell className='text-right font-bold'>
                {formatCurrency(
                  calculateTotalAmount(order, order.paymentCurrency),
                  order.paymentCurrency
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default OrderItems;
