'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Trash2,
  ShoppingCart,
  Plus,
  Minus,
  ShoppingBag,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

import { Button } from '@/ui/button';
import { Card, CardContent, CardFooter } from '@/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';
import { Separator } from '@/ui/separator';

import { useCart } from '@/hooks/useCart';
import OrderModal from '../orders/_components/OrderModal';

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<
    'BDT' | 'USD' | 'CNY'
  >('BDT');

  const {
    items,
    removeItem,
    updateQuantity,
    getSubTotal,
    getItemCount,
    clearCart,
  } = useCart();

  const subTotal = getSubTotal();
  const itemCount = getItemCount();
  const hasItems = items.length > 0;

  // Currency symbols
  const currencySymbols = {
    BDT: '৳',
    USD: '$',
    CNY: '¥',
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleCheckout = () => {
    if (!hasItems) return; // Prevent checkout if cart is empty

    if (!session) {
      router.push('/login?redirect=/checkout');
      return;
    }

    // Navigate to checkout route
    router.push('/checkout');
  };

  const handleOrderModal = () => {
    if (!hasItems) return;

    if (!session) {
      router.push('/login?redirect=/cart');
      return;
    }

    setOrderModalOpen(true);
  };

  // Prepare order data for modal
  const orderData = {
    products: items.map((item) => ({
      product: item.item._id,
      color: [item.color],
      size: [item.size],
      quantity: item.quantity,
      unitPrice: item.item.price || {
        cny: 0,
        usd: 0,
        bdt: 0,
      },
      totalPrice: item.totalPrice,
    })),
    subTotal: subTotal,
  };
  console.log(
    'Cart items>>',
    items.map((item) => item.item.title)
  );
  if (!hasItems) {
    return (
      <div className='container mx-auto py-16 px-4 pt-32'>
        <div className='max-w-4xl mx-auto text-center'>
          <ShoppingCart className='w-16 h-16 mx-auto text-gray-400 mb-6' />
          <h1 className='text-2xl font-bold mb-4'>Your Cart is Empty</h1>
          <p className='text-gray-600 mb-8'>
            Looks like you haven&apos;t added any products to your cart yet.
          </p>
          <Button
            asChild
            className='bg-blue-600 hover:bg-blue-700'
          >
            <Link href='/'>
              <ShoppingBag className='mr-2 h-4 w-4' />
              Browse Products
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8 px-4 pt-32'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl md:text-3xl font-bold'>Shopping Cart</h1>
          <Button
            variant='outline'
            size='sm'
            onClick={() => router.back()}
            className='flex items-center'
          >
            <ArrowLeft className='mr-1 h-4 w-4' />
            Continue Shopping
          </Button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2'>
            <Card>
              <CardContent className='p-0'>
                <div className='overflow-x-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-1/2'>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className='w-10'></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className='flex items-center space-x-4'>
                              <div className='relative h-16 w-16 rounded bg-gray-100 overflow-hidden'>
                                {item.item.media?.[0]?.url ? (
                                  <Image
                                    src={item.item.media[0].url}
                                    alt={item.item.title || 'Product image'}
                                    fill
                                    className='object-cover'
                                  />
                                ) : (
                                  <div className='flex h-full w-full items-center justify-center bg-gray-200'>
                                    <ShoppingBag className='h-8 w-8 text-gray-400' />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className='font-medium'>
                                  {item.item.title || 'Unnamed Product'}
                                </h3>
                                <div className='text-sm text-gray-500 mt-1'>
                                  {item.color && (
                                    <div className='relative h-6 w-6 rounded-full overflow-hidden inline-block mr-2'>
                                      <Image
                                        src={item.color}
                                        alt='Color variant'
                                        fill
                                        className='object-cover'
                                      />
                                    </div>
                                  )}
                                  {item.size && <span>Size: {item.size}</span>}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {currencySymbols[selectedCurrency]}
                            {item.item.price?.[
                              selectedCurrency.toLowerCase() as
                                | 'bdt'
                                | 'usd'
                                | 'cny'
                            ]?.toLocaleString() || '0'}
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center space-x-2'>
                              <Button
                                variant='outline'
                                size='icon'
                                className='h-8 w-8'
                                onClick={() =>
                                  handleQuantityChange(
                                    item.productId,
                                    item.quantity - 1
                                  )
                                }
                              >
                                <Minus className='h-4 w-4' />
                              </Button>
                              <span className='w-8 text-center'>
                                {item.quantity}
                              </span>
                              <Button
                                variant='outline'
                                size='icon'
                                className='h-8 w-8'
                                onClick={() =>
                                  handleQuantityChange(
                                    item.productId,
                                    item.quantity + 1
                                  )
                                }
                              >
                                <Plus className='h-4 w-4' />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className='font-medium'>
                            {currencySymbols[selectedCurrency]}
                            {item.totalPrice?.[
                              selectedCurrency.toLowerCase() as
                                | 'bdt'
                                | 'usd'
                                | 'cny'
                            ]?.toLocaleString() || '0'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => removeItem(item.productId)}
                              className='text-red-500 hover:text-red-700 hover:bg-red-50'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className='flex justify-between py-4'>
                <Button
                  variant='outline'
                  onClick={clearCart}
                  className='text-red-500 hover:bg-red-50'
                >
                  Clear Cart
                </Button>
                <div className='flex items-center space-x-2'>
                  <span className='text-sm text-gray-500'>Currency:</span>
                  <Select
                    value={selectedCurrency}
                    onValueChange={(value) =>
                      setSelectedCurrency(value as 'BDT' | 'USD' | 'CNY')
                    }
                  >
                    <SelectTrigger className='w-[100px]'>
                      <SelectValue placeholder='Currency' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='BDT'>BDT (৳)</SelectItem>
                      <SelectItem value='USD'>USD ($)</SelectItem>
                      <SelectItem value='CNY'>CNY (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardFooter>
            </Card>
          </div>

          <div>
            <Card>
              <CardContent className='pt-6'>
                <h2 className='text-xl font-semibold mb-4'>Order Summary</h2>
                <div className='space-y-4'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Items ({itemCount})</span>
                    <span>
                      {currencySymbols[selectedCurrency]}
                      {subTotal[
                        selectedCurrency.toLowerCase() as 'bdt' | 'usd' | 'cny'
                      ].toLocaleString()}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <Separator />
                  <div className='flex justify-between font-semibold text-lg'>
                    <span>Subtotal</span>
                    <span>
                      {currencySymbols[selectedCurrency]}
                      {subTotal[
                        selectedCurrency.toLowerCase() as 'bdt' | 'usd' | 'cny'
                      ].toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className='flex flex-col gap-3'>
                <Button
                  className='w-full bg-blue-600 hover:bg-blue-700'
                  size='lg'
                  onClick={handleCheckout}
                  disabled={!hasItems}
                >
                  Proceed to Checkout
                </Button>

                <Button
                  className='w-full'
                  variant='outline'
                  size='lg'
                  onClick={handleOrderModal}
                  disabled={!hasItems}
                >
                  Quick Order
                </Button>
              </CardFooter>
            </Card>

            {!session && (
              <Alert className='mt-4 bg-amber-50 border-amber-200'>
                <AlertCircle className='h-4 w-4 text-amber-600' />
                <AlertTitle className='text-amber-800'>
                  Login Required
                </AlertTitle>
                <AlertDescription className='text-amber-700'>
                  You need to be logged in to complete your purchase.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>

      {session?.user && (
        <OrderModal
          open={orderModalOpen}
          onOpenChange={setOrderModalOpen}
          userId={session.user.id}
          orderData={orderData}
        />
      )}
    </div>
  );
}
