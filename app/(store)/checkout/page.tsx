'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/ui/button';
import { Card, CardContent } from '@/ui/card';
import toast from 'react-hot-toast';
import Image from 'next/image';

const districts = [
  'Dhaka',
  'Chattogram',
  'Khulna',
  'Rajshahi',
  'Barisal',
  'Sylhet',
  'Rangpur',
  'Mymensingh',
];
const countries = ['Bangladesh'];
const deliveryMethods = ['Home Delivery', 'Office Collection'];

const shippingMethods = [
  {
    id: 'air-express',
    name: 'Air Express',
    cost: 5000,
    days: '3-5',
    description: 'Fastest delivery by air',
  },
  {
    id: 'air-standard',
    name: 'Air Standard',
    cost: 3500,
    days: '5-7',
    description: 'Standard air shipping',
  },
  {
    id: 'sea-express',
    name: 'Sea Express',
    cost: 2500,
    days: '15-20',
    description: 'Fastest sea shipping',
  },
  {
    id: 'sea-standard',
    name: 'Sea Standard',
    cost: 1500,
    days: '25-30',
    description: 'Standard sea shipping',
  },
];

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { products, clearCart } = useCart();

  // Flatten all variants for summary and calculations
  const allVariants = products.flatMap((p) =>
    p.variants.map((v) => ({ ...v, product: p.product }))
  );

  // Form state
  const [form, setForm] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    emergencyPhone: '',
    country: 'Bangladesh',
    district: '',
    city: '',
    address: '',
    deliveryMethod: deliveryMethods[0],
    shippingMethod: shippingMethods[0].id,
    orderNote: '',
    coupon: '',
  });
  const [couponApplied, setCouponApplied] = useState(false);

  const [loading, setLoading] = useState(false);

  // Price calculations
  const subTotal = allVariants.reduce(
    (sum, v) => sum + (v.totalPrice?.bdt || 0),
    0
  );
  const productPrice = subTotal;
  const eidDiscount = couponApplied ? Math.round(productPrice * 0.05) : 0;
  const selectedShipping = shippingMethods.find(
    (s) => s.id === form.shippingMethod
  );
  const shippingCost = selectedShipping?.cost || 0;
  const finalPrice = productPrice - eidDiscount + shippingCost;
  const partialPayment = Math.round(finalPrice * 0.7);
  const payOnDelivery = finalPrice - partialPayment;

  // Handlers
  const handleInput = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = () => {
    if (form.coupon.trim().toLowerCase() === 'eidchamak') {
      setCouponApplied(true);

      toast.success('Coupon applied!');
    } else {
      setCouponApplied(false);

      toast.error('Invalid coupon code');
    }
  };

  const handleOrder = async () => {
    // Basic validation
    if (
      !form.name ||
      !form.email ||
      !form.phone ||
      !form.district ||
      !form.city ||
      !form.address
    ) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (products.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }
    setLoading(true);
    // Simulate order placement
    setTimeout(() => {
      setLoading(false);
      clearCart();
      toast.success('Order placed successfully!');
      router.push('/orders');
    }, 1500);
  };

  return (
    <div className='container mx-auto py-8 px-4'>
      <div className='flex flex-col lg:flex-row gap-8'>
        {/* Left: Checkout Form */}
        <div className='flex-1 bg-white rounded-lg shadow p-6'>
          <h2 className='text-2xl font-bold mb-6'>CHECKOUT</h2>
          <form className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Name *</label>
                <input
                  name='name'
                  value={form.name}
                  onChange={handleInput}
                  className='w-full border rounded px-3 py-2'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Phone / Email *
                </label>
                <input
                  name='email'
                  value={form.email}
                  onChange={handleInput}
                  className='w-full border rounded px-3 py-2'
                  required
                />
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Emergency Phone *
                </label>
                <input
                  name='emergencyPhone'
                  value={form.emergencyPhone}
                  onChange={handleInput}
                  className='w-full border rounded px-3 py-2'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Country *
                </label>
                <select
                  name='country'
                  value={form.country}
                  onChange={handleInput}
                  className='w-full border rounded px-3 py-2'
                >
                  {countries.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  District *
                </label>
                <select
                  name='district'
                  value={form.district}
                  onChange={handleInput}
                  className='w-full border rounded px-3 py-2'
                >
                  <option value=''>Select</option>
                  {districts.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  City / Upazila *
                </label>
                <input
                  name='city'
                  value={form.city}
                  onChange={handleInput}
                  className='w-full border rounded px-3 py-2'
                  required
                />
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Address *
                </label>
                <input
                  name='address'
                  value={form.address}
                  onChange={handleInput}
                  className='w-full border rounded px-3 py-2'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Delivery Method *
                </label>
                <select
                  name='deliveryMethod'
                  value={form.deliveryMethod}
                  onChange={handleInput}
                  className='w-full border rounded px-3 py-2'
                >
                  {deliveryMethods.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Shipping Method *
                </label>
                <select
                  name='shippingMethod'
                  value={form.shippingMethod}
                  onChange={handleInput}
                  className='w-full border rounded px-3 py-2'
                >
                  {shippingMethods.map((method) => (
                    <option
                      key={method.id}
                      value={method.id}
                    >
                      {method.name} - ৳{method.cost} ({method.days} days)
                    </option>
                  ))}
                </select>
                {form.shippingMethod && (
                  <p className='text-xs text-gray-500 mt-1'>
                    {
                      shippingMethods.find((m) => m.id === form.shippingMethod)
                        ?.description
                    }
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>
                Order Note
              </label>
              <textarea
                name='orderNote'
                value={form.orderNote}
                onChange={handleInput}
                className='w-full border rounded px-3 py-2'
                rows={2}
              />
            </div>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className='w-full lg:w-[400px]'>
          <Card>
            <CardContent className='p-6'>
              <div className='mb-4'>
                <div className='flex justify-between text-sm mb-2'>
                  <span>Product Price</span>
                  <span>৳{productPrice}</span>
                </div>
                <div className='flex justify-between text-sm mb-2'>
                  <span>Shipping Cost</span>
                  <span className='text-gray-500 text-xs'>
                    Will be calculated when product arrives from China
                  </span>
                </div>
                <div className='flex justify-between font-semibold text-base border-t pt-2 mt-2'>
                  <span>Final Price</span>
                  <span>৳{productPrice}</span>
                </div>
              </div>
              <div className='bg-gray-100 rounded p-3 mb-4 text-center'>
                <div className='font-semibold'>
                  70% Payment - ৳{partialPayment}
                </div>
                <div className='text-xs mt-1'>
                  Pay on Delivery ৳{payOnDelivery} + Shipping & Courier Charges{' '}
                  <span className='inline-block align-middle ml-1'>ℹ️</span>
                </div>
              </div>
              <div className='flex mb-4'>
                <input
                  type='text'
                  name='coupon'
                  value={form.coupon}
                  onChange={handleInput}
                  placeholder='Coupon Code'
                  className='flex-1 border rounded-l px-3 py-2'
                  disabled={couponApplied}
                />
                <Button
                  type='button'
                  className='rounded-l-none'
                  onClick={handleApplyCoupon}
                  disabled={couponApplied}
                >
                  Apply
                </Button>
              </div>
              <Button
                className='w-full'
                onClick={handleOrder}
                disabled={loading}
              >
                {loading ? 'Placing Order...' : 'Place Order & Pay'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cart Items Summary */}
      <div className='max-w-4xl mx-auto mt-10'>
        <Card>
          <CardContent className='p-6'>
            <h3 className='text-lg font-semibold mb-4'>Order Summary</h3>
            {allVariants.length === 0 ? (
              <div className='text-gray-500'>No items in cart.</div>
            ) : (
              <div className='space-y-4'>
                {allVariants.map((item, idx) => (
                  <div
                    key={idx}
                    className='flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0'
                  >
                    <div className='relative w-16 h-16'>
                      <div className='w-16 h-16 bg-gray-200 flex items-center justify-center rounded overflow-hidden'>
                        {item.color ? (
                          <Image
                            src={
                              item.color.startsWith('http')
                                ? item.color
                                : `/api/media/${item.color}`
                            }
                            alt='Color variant'
                            className='object-cover w-full h-full'
                            fill
                          />
                        ) : (
                          'No Image'
                        )}
                      </div>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='font-medium truncate'>Product</div>
                      <div className='text-xs text-gray-500'>
                        Color:
                        <span className='inline-block align-middle ml-1'>
                          {item.color ? (
                            <Image
                              src={
                                item.color.startsWith('http')
                                  ? item.color
                                  : `/api/media/${item.color}`
                              }
                              alt='Color variant'
                              className='inline-block w-5 h-5 rounded-full border border-gray-200 object-cover mr-1'
                              width={20}
                              height={20}
                            />
                          ) : (
                            'N/A'
                          )}
                        </span>
                      </div>
                      <div className='text-xs text-gray-500'>
                        Size: {item.size || 'N/A'}
                      </div>
                    </div>
                    <div className='text-sm'>
                      {item.quantity} × ৳{item.unitPrice?.bdt || 0}
                    </div>
                    <div className='text-sm font-semibold'>
                      ৳{item.totalPrice?.bdt || 0}
                    </div>
                  </div>
                ))}
                <div className='border-t pt-4 mt-4 space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Subtotal</span>
                    <span>৳{subTotal}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Shipping</span>
                    <span className='text-gray-500 text-xs'>
                      Will be calculated when product arrives from China
                    </span>
                  </div>
                  <div className='flex justify-between font-semibold text-base border-t pt-2 mt-2'>
                    <span>Total</span>
                    <span>৳{productPrice}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
