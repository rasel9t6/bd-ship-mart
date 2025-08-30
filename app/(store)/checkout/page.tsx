'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/ui/button';
import { Card, CardContent } from '@/ui/card';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form';
import { Input } from '@/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';
import { Textarea } from '@/ui/textarea';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const districts = [
  'Bagerhat',
  'Bandarban',
  'Barguna',
  'Barisal',
  'Bhola',
  'Bogra',
  'Brahmanbaria',
  'Chandpur',
  'Chapainawabganj',
  'Chattogram',
  'Chuadanga',
  'Comilla',
  "Cox's Bazar",
  'Dhaka',
  'Dinajpur',
  'Faridpur',
  'Feni',
  'Gaibandha',
  'Gazipur',
  'Gopalganj',
  'Habiganj',
  'Jamalpur',
  'Jessore',
  'Jhalokati',
  'Jhenaidah',
  'Joypurhat',
  'Khagrachari',
  'Khulna',
  'Kishoreganj',
  'Kurigram',
  'Kushtia',
  'Lakshmipur',
  'Lalmonirhat',
  'Madaripur',
  'Magura',
  'Manikganj',
  'Meherpur',
  'Moulvibazar',
  'Munshiganj',
  'Mymensingh',
  'Naogaon',
  'Narail',
  'Narayanganj',
  'Narsingdi',
  'Natore',
  'Netrokona',
  'Nilphamari',
  'Noakhali',
  'Pabna',
  'Panchagarh',
  'Patuakhali',
  'Pirojpur',
  'Rajbari',
  'Rajshahi',
  'Rangamati',
  'Rangpur',
  'Satkhira',
  'Shariatpur',
  'Sherpur',
  'Sirajganj',
  'Sunamganj',
  'Sylhet',
  'Tangail',
  'Thakurgaon',
];
const countries = ['Bangladesh'];
const deliveryTypes = ['Home Delivery', 'Office Collection'];

const shippingMethods = [
  {
    id: 'air',
    name: 'Air',
    days: '3-5',
    description: 'Fastest delivery by air',
  },
  {
    id: 'sea',
    name: 'Sea',
    days: '15-20',
    description: 'Fastest sea shipping',
  },
];

const paymentMethods = [
  { id: 'cash', name: 'Cash on Delivery' },
  { id: 'card', name: 'Credit/Debit Card' },
  { id: 'bkash', name: 'bKash' },
];

interface CheckoutItem {
  product: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: {
    bdt: number;
    cny: number;
    usd: number;
  };
  totalPrice: {
    bdt: number;
    cny: number;
    usd: number;
  };
}

interface CartProduct {
  product: string;
  variants: Array<{
    color: string;
    size: string;
    quantity: number;
    unitPrice: {
      bdt: number;
      cny: number;
      usd: number;
    };
    totalPrice: {
      bdt: number;
      cny: number;
      usd: number;
    };
  }>;
}

// Form validation schema
const checkoutSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  country: z.string().min(1, 'Country is required'),
  district: z.string().min(1, 'District is required'),
  city: z.string().min(1, 'City is required'),
  street: z.string().min(1, 'Street address is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  deliveryType: z.string().min(1, 'Delivery type is required'),
  shippingMethod: z.string().min(1, 'Shipping method is required'),
  paymentMethod: z.enum(['cash', 'card', 'bkash'], {
    required_error: 'Payment method is required',
  }),
  orderNote: z.string().optional(),
  coupon: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { products: cartProducts, clearCart } = useCart();
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [couponApplied, setCouponApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [profileCheckLoading, setProfileCheckLoading] = useState(true);
  const router = useRouter();

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      country: 'Bangladesh',
      district: '',
      city: '',
      street: '',
      postalCode: '',
      deliveryType: deliveryTypes[0],
      shippingMethod: shippingMethods[0].id,
      paymentMethod: 'cash',
    },
  });

  // Check profile completion when session is available
  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!session?.user?.id) {
        setProfileCheckLoading(false);
        return;
      }

      console.log('Checkout page - Session user:', {
        id: session.user.id,
        userId: session.user.userId,
        email: session.user.email,
        name: session.user.name,
      });

      try {
        const response = await fetch(
          `/api/users/profile-completion?userId=${session.user.id}`
        );

        console.log('Profile completion API response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Profile completion API data:', data);

          setProfileComplete(data.isComplete);

          if (data.isComplete) {
            // Update form with user data
            form.setValue('name', session.user.name || '');
            form.setValue('email', session.user.email || '');
            form.setValue('phone', session.user.phone || '');

            // Update address fields if available
            if (data.user.address) {
              form.setValue(
                'country',
                data.user.address.country || 'Bangladesh'
              );
              form.setValue('district', data.user.address.state || '');
              form.setValue('city', data.user.address.city || '');
              form.setValue('street', data.user.address.street || '');
              form.setValue('postalCode', data.user.address.zipCode || '');
            }
          }
        } else {
          const errorData = await response.json();
          console.error('Profile completion API error:', errorData);
        }
      } catch (error) {
        console.error('Error checking profile completion:', error);
      } finally {
        setProfileCheckLoading(false);
      }
    };

    checkProfileCompletion();
  }, [session, form]);

  // Fetch last order data and update form
  useEffect(() => {
    const fetchLastOrder = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(
          `/api/orders/last?userId=${session.user.id}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data) {
            // Update form with last order data
            form.setValue(
              'phone',
              data.customerInfo?.phone || session?.user?.phone || ''
            );
            form.setValue(
              'country',
              data.shippingAddress?.country || 'Bangladesh'
            );
            form.setValue('district', data.shippingAddress?.state || '');
            form.setValue('city', data.shippingAddress?.city || '');
            form.setValue('street', data.shippingAddress?.street || '');
            form.setValue('postalCode', data.shippingAddress?.postalCode || '');
            form.setValue(
              'deliveryType',
              data.deliveryType || deliveryTypes[0]
            );
            form.setValue(
              'shippingMethod',
              data.shippingMethod || shippingMethods[0].id
            );
            form.setValue('paymentMethod', data.paymentMethod || 'cash');
          }
        }
      } catch (error) {
        console.error('Error fetching last order:', error);
      }
    };

    fetchLastOrder();
  }, [session?.user?.id, session?.user?.phone, form]);

  // Load checkout items from session storage on mount
  useEffect(() => {
    const storedItems = sessionStorage.getItem('checkoutItems');
    if (storedItems) {
      setCheckoutItems(JSON.parse(storedItems));
      // Clear the stored items after loading
      sessionStorage.removeItem('checkoutItems');
    }
  }, []);

  // Use either checkout items or cart products
  const products = checkoutItems.length > 0 ? checkoutItems : cartProducts;

  // Flatten all variants for summary and calculations
  const allVariants = products.flatMap((p) => {
    if ('variants' in p) {
      // Handle cart products
      return (p as CartProduct).variants.map((v) => ({
        ...v,
        product: p.product,
      }));
    } else {
      // Handle direct checkout items
      return [p as CheckoutItem];
    }
  });

  // Calculate prices
  const productPrice = allVariants.reduce(
    (sum, v) => sum + (v.totalPrice?.bdt || 0),
    0
  );
  const eidDiscount = couponApplied ? Math.round(productPrice * 0.05) : 0;
  const finalPrice = productPrice - eidDiscount;

  const handleApplyCoupon = () => {
    const coupon = form.watch('coupon');
    if (coupon?.trim().toLowerCase() === 'eidchamak') {
      setCouponApplied(true);
      toast.success('Coupon applied!');
    } else {
      setCouponApplied(false);
      toast.error('Invalid coupon code');
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (allVariants.length === 0) {
      toast.error('No items to order.');
      return;
    }

    setLoading(true);

    try {
      // Fetch product IDs for all products
      const productIds = await Promise.all(
        allVariants.map(async (item) => {
          const response = await fetch(`/api/products/by-slug/${item.product}`);
          if (!response.ok) throw new Error('Failed to fetch product');
          const product = await response.json();
          return product._id;
        })
      );

      // Prepare order data according to the Order model
      const orderData = {
        customerInfo: session?.user?.id,
        products: allVariants.map((item, index) => ({
          product: productIds[index],
          color: [item.color],
          size: [item.size],
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
        shippingAddress: {
          street: data.street,
          city: data.city,
          state: data.district,
          postalCode: data.postalCode,
          country: data.country,
        },
        shippingMethod: data.shippingMethod,
        deliveryType: data.deliveryType,
        paymentMethod: data.paymentMethod,
        paymentCurrency: 'BDT',
        notes: data.orderNote
          ? [{ text: data.orderNote, isInternal: false }]
          : [],
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'Incomplete profile information') {
          toast.error(`Profile incomplete: ${errorData.message}`);
          router.push(`/profile/${session?.user?.userId}`);
          return;
        } else if (errorData.error === 'Incomplete shipping address') {
          toast.error(`Shipping address incomplete: ${errorData.message}`);
          return;
        } else {
          throw new Error(errorData.message || 'Failed to create order');
        }
      }

      const order = await response.json();

      // Clear cart and show success message
      if (checkoutItems.length === 0) {
        clearCart();
      }
      toast.success('Order placed successfully!');

      // Redirect to bKash payment if selected
      if (data.paymentMethod === 'bkash') {
        router.push(`/payment/bkash?orderId=${order.orderId}`);
      } else {
        router.push('/orders');
      }
    } catch {
      setLoading(false);
      toast.error('Failed to place order. Please try again.');
    }
  };

  // Show loading state while checking profile
  if (profileCheckLoading) {
    return (
      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-center'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
              <p className='mt-4 text-gray-600'>
                Checking profile completion...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show profile completion requirement if profile is incomplete
  if (!profileComplete) {
    return (
      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900'>
              Profile Completion Required
            </h1>
            <p className='mt-2 text-gray-600'>
              Please complete your profile information before placing an order
            </p>
          </div>

          <Card className='max-w-2xl mx-auto'>
            <CardContent className='p-6'>
              <div className='text-center space-y-4'>
                <div className='text-6xl'>📝</div>
                <h2 className='text-xl font-semibold'>Complete Your Profile</h2>
                <p className='text-gray-600'>
                  To ensure smooth order processing and delivery, we need you to
                  complete your profile with:
                </p>
                <ul className='text-left text-gray-600 space-y-2 max-w-md mx-auto'>
                  <li>• Full name</li>
                  <li>• Email address</li>
                  <li>• Phone number</li>
                  <li>• Complete shipping address</li>
                </ul>
                <Button
                  onClick={() =>
                    router.push(`/profile/${session?.user?.userId}`)
                  }
                  className='mt-4'
                >
                  Complete Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto pt-24 pb-5 px-4'>
      <div className='flex flex-col lg:flex-row gap-8'>
        {/* Left: Checkout Form */}
        <div className='flex-1 bg-white rounded-lg shadow p-6'>
          <h2 className='text-2xl font-bold mb-6'>CHECKOUT</h2>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4'
            >
              {/* Personal Information */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Name <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type='email'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phone <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type='tel'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='country'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Country <span className='text-red-500'>*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select country' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem
                              key={country}
                              value={country}
                            >
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Address Information */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='district'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>
                        District <span className='text-red-500'>*</span>
                      </FormLabel>
                      <Popover
                        open={districtOpen}
                        onOpenChange={setDistrictOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant='outline'
                              role='combobox'
                              className={cn(
                                'w-full justify-between',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value
                                ? districts.find(
                                    (district) => district === field.value
                                  )
                                : 'Select district'}
                              <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-full p-0'>
                          <Command className='max-h-[300px]'>
                            <CommandInput placeholder='Search district...' />
                            <CommandEmpty>No district found.</CommandEmpty>
                            <CommandGroup className='max-h-[250px] overflow-y-auto'>
                              {districts.map((district) => (
                                <CommandItem
                                  value={district}
                                  key={district}
                                  onSelect={() => {
                                    form.setValue('district', district);
                                    setDistrictOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      district === field.value
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  {district}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='city'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        City / Upazila <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='street'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Street Address <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='postalCode'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Postal Code <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='e.g., 1000'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Delivery & Shipping */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='deliveryType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Delivery Type <span className='text-red-500'>*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select delivery type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {deliveryTypes.map((type) => (
                            <SelectItem
                              key={type}
                              value={type}
                            >
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='shippingMethod'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Shipping Method <span className='text-red-500'>*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select shipping method' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {shippingMethods.map((method) => (
                            <SelectItem
                              key={method.id}
                              value={method.id}
                            >
                              {method.name} ({method.days} days)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Payment Information */}
              <div className='grid grid-cols-1 gap-4'>
                <FormField
                  control={form.control}
                  name='paymentMethod'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Payment Method <span className='text-red-500'>*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select payment method' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem
                              key={method.id}
                              value={method.id}
                            >
                              {method.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='orderNote'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Note</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
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
                <div className='flex justify-between font-semibold text-base border-t pt-2 mt-2'>
                  <span>Final Price</span>
                  <span>৳{finalPrice}</span>
                </div>
              </div>
              <Form {...form}>
                <div className='flex mb-4'>
                  <FormField
                    control={form.control}
                    name='coupon'
                    render={({ field }) => (
                      <FormItem className='flex-1'>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder='Coupon Code'
                            className='rounded-r-none'
                            disabled={couponApplied}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
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
              </Form>
              <Button
                className='w-full'
                onClick={form.handleSubmit(onSubmit)}
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
                    <span>৳{productPrice}</span>
                  </div>
                  <div className='flex justify-between font-semibold text-base border-t pt-2 mt-2'>
                    <span>Total</span>
                    <span>৳{finalPrice}</span>
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
