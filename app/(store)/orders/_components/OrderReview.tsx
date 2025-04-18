import { useFormContext } from 'react-hook-form';
import { FileText, User, MapPin, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Badge } from '@/ui/badge';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/ui/table';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/ui/form';
import { Textarea } from '@/ui/textarea';
import Image from 'next/image';

interface OrderReviewProps {
  products: Array<{
    product: {
      _id: string;
      name: string;
    };
    color: string[];
    size: string[];
    quantity: number;
    totalPrice: {
      bdt: number;
    };
  }>;
}

export const OrderReview = ({ products }: OrderReviewProps) => {
  const form = useFormContext();

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'BDT':
        return '৳';
      case 'USD':
        return '$';
      case 'CNY':
        return '¥';
      default:
        return '';
    }
  };

  const calculateTotal = () => {
    return products.reduce((sum, product) => sum + product.totalPrice.bdt, 0);
  };

  return (
    <div className='space-y-6'>
      {/* Order Summary */}
      <div>
        <h3 className='text-lg font-medium mb-4 flex items-center gap-2'>
          <FileText className='h-5 w-5 text-blue-600' />
          Order Summary
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Customer Information */}
          <Card>
            <CardHeader className='pb-2 bg-gray-50'>
              <CardTitle className='text-sm font-medium flex items-center gap-2'>
                <User className='h-4 w-4 text-gray-600' />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className='p-4 text-sm'>
              <dl className='space-y-2'>
                <div className='flex justify-between'>
                  <dt className='text-gray-600'>Name:</dt>
                  <dd className='font-medium'>
                    {form.getValues().customerInfo.name}
                  </dd>
                </div>
                <div className='flex justify-between'>
                  <dt className='text-gray-600'>Email:</dt>
                  <dd className='font-medium'>
                    {form.getValues().customerInfo.email}
                  </dd>
                </div>
                <div className='flex justify-between'>
                  <dt className='text-gray-600'>Phone:</dt>
                  <dd className='font-medium'>
                    {form.getValues().customerInfo.phone}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader className='pb-2 bg-gray-50'>
              <CardTitle className='text-sm font-medium flex items-center gap-2'>
                <MapPin className='h-4 w-4 text-gray-600' />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className='p-4 text-sm'>
              <p>{form.getValues().shippingAddress.street}</p>
              <p>
                {form.getValues().shippingAddress.city},{' '}
                {form.getValues().shippingAddress.state}{' '}
                {form.getValues().shippingAddress.postalCode}
              </p>
              <p>{form.getValues().shippingAddress.country}</p>
            </CardContent>
          </Card>
        </div>

        {/* Order Details */}
        <Card className='mt-4'>
          <CardHeader className='pb-2 bg-gray-50 border-b'>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <Package className='h-4 w-4 text-gray-600' />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
            <div className='p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm border-b'>
              <div>
                <p className='text-gray-600 mb-1'>Shipping Method</p>
                <Badge
                  variant='outline'
                  className='bg-blue-50 text-blue-700 font-normal'
                >
                  {form.getValues().shippingMethod === 'air'
                    ? 'Air Shipping'
                    : 'Sea Shipping'}
                </Badge>
              </div>
              <div>
                <p className='text-gray-600 mb-1'>Delivery Type</p>
                <Badge
                  variant='outline'
                  className='bg-green-50 text-green-700 font-normal'
                >
                  {form.getValues().deliveryType === 'door-to-door'
                    ? 'Door to Door'
                    : 'Warehouse Pickup'}
                </Badge>
              </div>
              <div>
                <p className='text-gray-600 mb-1'>Payment Method</p>
                <div className='flex items-center gap-2'>
                  <Badge
                    variant='outline'
                    className='bg-purple-50 text-purple-700 font-normal'
                  >
                    {form.getValues().paymentMethod === 'cash'
                      ? 'Cash'
                      : 'Card'}
                  </Badge>
                  <Badge
                    variant='outline'
                    className='bg-gray-50 font-normal'
                  >
                    {getCurrencySymbol(form.getValues().paymentCurrency)}{' '}
                    {form.getValues().paymentCurrency}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Products List */}
            {products.length > 0 ? (
              <div>
                <Table>
                  <TableHeader className='bg-gray-50'>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Specifications</TableHead>
                      <TableHead className='text-center'>Qty</TableHead>
                      <TableHead className='text-right'>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell className='font-medium'>
                          {product.product.name || 'Product Name'}
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-wrap gap-1'>
                            {product.size.map((s, i) => (
                              <Badge
                                key={i}
                                variant='outline'
                                className='text-xs'
                              >
                                {s}
                              </Badge>
                            ))}
                            {product.color.map((c, i) => (
                              <Image
                                key={i}
                                src={c}
                                alt='product color'
                                width={16}
                                height={16}
                                className='h-6 w-6 rounded-full border border-gray-200'
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className='text-center'>
                          {product.quantity}
                        </TableCell>
                        <TableCell className='text-right'>
                          {getCurrencySymbol('BDT')}{' '}
                          {product.totalPrice.bdt.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className='text-right font-medium'
                      >
                        Total
                      </TableCell>
                      <TableCell className='text-right font-bold text-blue-800'>
                        {getCurrencySymbol('BDT')}{' '}
                        {calculateTotal().toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className='p-6 text-center'>
                <p className='text-gray-500'>
                  No products added to this order yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Notes */}
        <div className='mt-4'>
          <FormField
            control={form.control}
            name='notes'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='flex items-center gap-2'>
                  <FileText className='h-4 w-4' />
                  Order Notes (Optional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='Add any special instructions or notes for this order...'
                    className='h-24 border-gray-300'
                  />
                </FormControl>
                <FormDescription className='text-xs text-gray-500'>
                  These notes will be visible to the customer and our team.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};
