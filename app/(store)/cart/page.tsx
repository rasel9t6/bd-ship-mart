'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
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
  // Add a ref to track the last toast time for each product
  const lastToastTimeRef = useRef<Record<string, number>>({});

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
    // Find the specific cart item to get its minimum order quantity
    const cartItem = items.find((item) => item.productId === productId);
    if (!cartItem) return;

    // Get minimum order quantity from the product, default to 1 if not specified
    const minOrderQty = cartItem.item.minimumOrderQuantity || 1;

    // Check if new quantity is below minimum order quantity
    if (newQuantity < minOrderQty) {
      // Set to minimum order quantity instead
      updateQuantity(productId, minOrderQty);

      // Check if we should show a toast (no more than once per 2 seconds per product)
      const now = Date.now();
      const lastToastTime = lastToastTimeRef.current[productId] || 0;
      if (now - lastToastTime > 2000) {
        toast.error(
          `Minimum order quantity for this product is ${minOrderQty}`
        );
        lastToastTimeRef.current[productId] = now;
      }

      return;
    }

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
      color: item.color,
      size: item.size,
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
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>
            Shopping Cart
          </h1>
          <Button
            variant='outline'
            size='sm'
            onClick={() => router.back()}
            className='flex items-center hover:bg-gray-100'
          >
            <ArrowLeft className='mr-1 h-4 w-4' />
            Continue Shopping
          </Button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2'>
            <Card className='border border-gray-200 shadow-sm overflow-hidden'>
              <CardContent className='p-0'>
                <div className='overflow-x-auto'>
                  <Table>
                    <TableHeader className='bg-gray-50'>
                      <TableRow>
                        <TableHead className='w-1/2 py-4'>Product</TableHead>
                        <TableHead className='py-4'>Price</TableHead>
                        <TableHead className='py-4'>Quantity</TableHead>
                        <TableHead className='py-4'>Total</TableHead>
                        <TableHead className='w-10 py-4'></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow
                          key={index}
                          className='hover:bg-gray-50 transition-colors'
                        >
                          <TableCell className='py-4'>
                            <div className='flex items-center space-x-4'>
                              <div className='relative h-20 w-20 rounded bg-gray-100 overflow-hidden border border-gray-200'>
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
                                <h3 className='font-medium text-gray-900'>
                                  {item.item.title || 'Unnamed Product'}
                                </h3>
                                <div className='text-sm text-gray-500 mt-1 flex items-center gap-2'>
                                  {item.color && item.color[0] && (
                                    <div className='flex items-center'>
                                      <span className='mr-1'>Color:</span>
                                      <div className='relative h-6 w-6 rounded-full overflow-hidden inline-block border border-gray-200'>
                                        <Image
                                          src={
                                            item.color[0].startsWith('http')
                                              ? item.color[0]
                                              : `/api/media/${item.color[0]}`
                                          }
                                          alt='Color variant'
                                          fill
                                          className='object-cover'
                                        />
                                      </div>
                                    </div>
                                  )}
                                  {item.size && item.size[0] && (
                                    <span>Size: {item.size[0]}</span>
                                  )}
                                </div>
                                {/* Display all available variants */}
                                <div className='text-xs text-gray-400 mt-1'>
                                  {item.item.colors &&
                                    item.item.colors.length > 0 && (
                                      <div className='flex items-center gap-1 mt-1'>
                                        <span>Available Colors:</span>
                                        <div className='flex gap-1'>
                                          {item.item.colors.map(
                                            (color, idx) => (
                                              <div
                                                key={idx}
                                                className='relative h-4 w-4 rounded-full overflow-hidden border border-gray-200'
                                              >
                                                <Image
                                                  src={
                                                    color.url.startsWith('http')
                                                      ? color.url
                                                      : `/api/media/${color.url}`
                                                  }
                                                  alt={`Color ${idx + 1}`}
                                                  fill
                                                  className='object-cover'
                                                />
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  {item.item.sizes &&
                                    item.item.sizes.length > 0 && (
                                      <div className='flex items-center gap-1 mt-1'>
                                        <span>Available Sizes:</span>
                                        <div className='flex gap-1'>
                                          {item.item.sizes.map((size, idx) => (
                                            <span
                                              key={idx}
                                              className={`text-xs px-1 py-0.5 rounded ${
                                                size === item.size[0]
                                                  ? 'bg-blue-100 text-blue-800'
                                                  : 'bg-gray-100 text-gray-600'
                                              }`}
                                            >
                                              {size}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className='text-gray-700'>
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
                                className='h-8 w-8 border-gray-300 hover:bg-gray-100'
                                onClick={() =>
                                  handleQuantityChange(
                                    item.productId,
                                    item.quantity - 1
                                  )
                                }
                              >
                                <Minus className='h-4 w-4' />
                              </Button>
                              <span className='w-8 text-center font-medium'>
                                {item.quantity}
                              </span>
                              <Button
                                variant='outline'
                                size='icon'
                                className='h-8 w-8 border-gray-300 hover:bg-gray-100'
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
                          <TableCell className='font-medium text-gray-900'>
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
              <CardFooter className='flex justify-between py-5 px-6 bg-gray-50 border-t border-gray-200'>
                <Button
                  variant='outline'
                  onClick={clearCart}
                  className='text-red-500 hover:bg-red-50 border-red-200'
                >
                  <Trash2 className='h-4 w-4 mr-2' />
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
                    <SelectTrigger className='w-[100px] border-gray-300'>
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
            <Card className='border border-gray-200 shadow-sm overflow-hidden'>
              <CardContent className='pt-6 px-6'>
                <h2 className='text-xl font-semibold mb-6 text-gray-900'>
                  Order Summary
                </h2>
                <div className='space-y-4'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Items ({itemCount})</span>
                    <span className='font-medium'>
                      {currencySymbols[selectedCurrency]}
                      {subTotal[
                        selectedCurrency.toLowerCase() as 'bdt' | 'usd' | 'cny'
                      ].toLocaleString()}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Shipping</span>
                    <span className='text-gray-700'>
                      Calculated at checkout
                    </span>
                  </div>
                  <Separator className='my-2' />
                  <div className='flex justify-between font-semibold text-lg pt-2'>
                    <span className='text-gray-900'>Subtotal</span>
                    <span className='text-gray-900'>
                      {currencySymbols[selectedCurrency]}
                      {subTotal[
                        selectedCurrency.toLowerCase() as 'bdt' | 'usd' | 'cny'
                      ].toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className='flex flex-col gap-3 px-6 py-6 bg-gray-50 border-t border-gray-200'>
                <Button
                  className='w-full bg-blue-600 hover:bg-blue-700 text-white'
                  size='lg'
                  onClick={handleCheckout}
                  disabled={!hasItems}
                >
                  Proceed to Checkout
                </Button>

                <Button
                  className='w-full border-blue-200 text-blue-700 hover:bg-blue-50'
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
