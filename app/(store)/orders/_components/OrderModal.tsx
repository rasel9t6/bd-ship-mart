'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider } from 'react-hook-form';

import {
  Loader2,
  AlertCircle,
  User,
  MapPin,
  CreditCard,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Progress } from '@/ui/progress';
import { ScrollArea } from '@/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/ui/alert-dialog';

import { CustomerInfoForm } from './CustomerInfoForm';
import { ShippingAddressForm } from './ShippingAddressForm';
import { PaymentShippingForm } from './PaymentShippingForm';
import { OrderReview } from './OrderReview';
import toast from 'react-hot-toast';
import { BkashPayment } from './BkashPayment';

// Form schema using Zod
const formSchema = z.object({
  customerInfo: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(1, 'Phone is required'),
  }),
  shippingAddress: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
  shippingMethod: z.enum(['air', 'sea']),
  deliveryType: z.enum(['door-to-door', 'warehouse']),
  paymentMethod: z.enum(['cash', 'card', 'bkash']),
  paymentCurrency: z.enum(['BDT', 'USD', 'CNY']),
  bkashNumber: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface OrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  orderData?: {
    products: {
      product: string; // Product ID
      color: string[];
      size: string[];
      quantity: number;
      unitPrice: {
        cny: number;
        usd: number;
        bdt: number;
      };
      totalPrice: {
        cny: number;
        usd: number;
        bdt: number;
      };
    }[];
  };
  productInfo?: {
    _id: string;
    name: string;
  };
}

interface CreatedOrder {
  _id: string;
  orderId: string;
  totalAmount: {
    bdt: number;
    usd: number;
    cny: number;
  };
  paymentMethod: string;
  paymentCurrency: string;
}

const OrderModal = ({
  open,
  onOpenChange,
  userId,
  orderData,
  productInfo,
}: OrderModalProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [user, setUser] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  } | null>(null);
  const [products, setProducts] = useState<
    Array<{
      product: {
        _id: string;
        name: string;
      };
      color: string[];
      size: string[];
      quantity: number;
      unitPrice: {
        cny: number;
        usd: number;
        bdt: number;
      };
      totalPrice: {
        bdt: number;
      };
    }>
  >([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('customer');
  const [formCompletion, setFormCompletion] = useState(0);
  const [showBkashPayment, setShowBkashPayment] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerInfo: {
        name: '',
        email: '',
        phone: '',
      },
      shippingAddress: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Bangladesh',
      },
      shippingMethod: 'air',
      deliveryType: 'door-to-door',
      paymentMethod: 'bkash',
      paymentCurrency: 'BDT',
      bkashNumber: '',
      notes: '',
    },
    mode: 'onChange',
  });

  // Initialize products from orderData if available
  useEffect(() => {
    if (orderData?.products) {
      const formattedProducts = orderData.products.map((product) => ({
        product: {
          _id: product.product,
          name: productInfo?.name || 'Product',
        },
        color: product.color || [],
        size: product.size || [],
        quantity: product.quantity || 1,
        unitPrice: product.unitPrice || {
          cny: 0,
          usd: 0,
          bdt: 0,
        },
        totalPrice: product.totalPrice || {
          cny: 0,
          usd: 0,
          bdt: 0,
        },
      }));
      setProducts(formattedProducts);
    }
  }, [orderData, productInfo]);

  // Calculate form completion
  useEffect(() => {
    const formState = form.getValues();
    const customerInfoValid =
      formState.customerInfo.name &&
      formState.customerInfo.email &&
      formState.customerInfo.phone;
    const shippingAddressValid =
      formState.shippingAddress.street &&
      formState.shippingAddress.city &&
      formState.shippingAddress.state &&
      formState.shippingAddress.postalCode &&
      formState.shippingAddress.country;

    let completionPercentage = 0;
    if (customerInfoValid) completionPercentage += 33;
    if (shippingAddressValid) completionPercentage += 33;
    if (
      formState.shippingMethod &&
      formState.deliveryType &&
      formState.paymentMethod &&
      formState.paymentCurrency
    ) {
      completionPercentage += 34;
    }

    setFormCompletion(completionPercentage);
  }, [form.watch()]);

  // Fetch user data and latest order
  useEffect(() => {
    if (open && userId) {
      fetchUserData();
    }
  }, [open, userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Fetch user data with populated latest order
      const response = await fetch(`/api/users/${userId}?populate=orders`);
      const data = await response.json();
      setUser(data);

      // Set form values based on user data
      form.setValue('customerInfo.name', data.name || '');
      form.setValue('customerInfo.email', data.email || '');
      form.setValue('customerInfo.phone', data.phone || '');

      if (data.address) {
        form.setValue('shippingAddress.street', data.address.street || '');
        form.setValue('shippingAddress.city', data.address.city || '');
        form.setValue('shippingAddress.state', data.address.state || '');
        form.setValue('shippingAddress.postalCode', data.address.zipCode || '');
        form.setValue('shippingAddress.country', data.address.country || '');
      }

      // Get latest order if exists
      if (data.orders && data.orders.length > 0) {
        const latestOrder = data.orders[0]; // Assuming orders are sorted by date desc

        // Pre-fill form with latest order data
        if (latestOrder.shippingMethod) {
          form.setValue('shippingMethod', latestOrder.shippingMethod);
        }

        if (latestOrder.deliveryType) {
          form.setValue('deliveryType', latestOrder.deliveryType);
        }

        if (latestOrder.paymentMethod) {
          form.setValue('paymentMethod', latestOrder.paymentMethod);
        }

        if (latestOrder.paymentCurrency) {
          form.setValue('paymentCurrency', latestOrder.paymentCurrency);
        }

        if (latestOrder.shippingAddress) {
          form.setValue('shippingAddress', {
            street: latestOrder.shippingAddress.street || '',
            city: latestOrder.shippingAddress.city || '',
            state: latestOrder.shippingAddress.state || '',
            postalCode: latestOrder.shippingAddress.postalCode || '',
            country: latestOrder.shippingAddress.country || '',
          });
        }

        if (latestOrder.products) {
          setProducts(latestOrder.products);
        }
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitLoading(true);
    setError('');

    try {
      // Prepare order data
      const orderData = {
        customerInfo: userId, // Reference to user ID
        products: products.map((p) => ({
          product: p.product._id || p.product,
          color: p.color,
          size: p.size,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          totalPrice: p.totalPrice,
        })),
        shippingAddress: values.shippingAddress,
        shippingMethod: values.shippingMethod,
        deliveryType: values.deliveryType,
        paymentMethod: values.paymentMethod,
        paymentCurrency: values.paymentCurrency,
        bkashNumber: values.bkashNumber,
        notes: values.notes
          ? [
              {
                text: values.notes,
                createdBy: user?.name || 'Unknown User',
                isInternal: false,
              },
            ]
          : [],
      };

      // Create new order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();
      setCreatedOrder(order);

      // Update user data if needed (when fields were previously empty)
      const userUpdateData: Partial<typeof user> = {};

      if (user && !user.phone && values.customerInfo.phone) {
        userUpdateData.phone = values.customerInfo.phone;
      }

      if (user && (!user.address || !user.address.street)) {
        userUpdateData.address = {
          street: values.shippingAddress.street,
          city: values.shippingAddress.city,
          state: values.shippingAddress.state,
          zipCode: values.shippingAddress.postalCode,
          country: values.shippingAddress.country,
        };
      }

      // Only update if we have data to update
      if (Object.keys(userUpdateData).length > 0) {
        const userResponse = await fetch(`/api/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userUpdateData),
        });

        if (!userResponse.ok) {
          throw new Error('Failed to update user data');
        }
      }

      // Success
      onOpenChange(false);
      toast.success('Order created successfully');
      router.push('/cart');
      router.refresh(); // Refresh the page data

      if (values.paymentMethod === 'bkash') {
        setShowBkashPayment(true);
      }
    } catch (err) {
      toast.error('Failed to create order. Please try again.');
      console.error('Error creating order:', err);
      setError('Failed to create order. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Helper to advance to next tab
  const advanceTab = async (current: string) => {
    if (current === 'customer') {
      // Validate customer tab fields before advancing
      const customerInfoValid = await form.trigger([
        'customerInfo.name',
        'customerInfo.email',
        'customerInfo.phone',
      ]);
      if (customerInfoValid) {
        setActiveTab('shipping');
      }
    } else if (current === 'shipping') {
      // Validate shipping tab fields before advancing
      const shippingAddressValid = await form.trigger([
        'shippingAddress.street',
        'shippingAddress.city',
        'shippingAddress.state',
        'shippingAddress.postalCode',
        'shippingAddress.country',
      ]);
      if (shippingAddressValid) {
        setActiveTab('payment');
      }
    } else if (current === 'payment') {
      // Validate payment tab fields before advancing
      const paymentValid = await form.trigger([
        'shippingMethod',
        'deliveryType',
        'paymentMethod',
        'paymentCurrency',
      ]);
      if (paymentValid) {
        setActiveTab('review');
      }
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-hidden p-0'>
        <DialogHeader className='p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b'>
          <div className='flex justify-between items-center'>
            <div>
              <DialogTitle className='text-2xl font-bold text-blue-800'>
                Create New Order
              </DialogTitle>
              <DialogDescription className='text-blue-600 mt-1'>
                Complete the form to create a new order for{' '}
                {user?.name || 'this customer'}
              </DialogDescription>
            </div>
            <Badge
              variant='outline'
              className='bg-blue-100 text-blue-800 px-3 py-1 font-medium'
            >
              {formCompletion}% Complete
            </Badge>
          </div>
          <Progress
            value={formCompletion}
            className='h-1 mt-2'
          />
        </DialogHeader>

        {error && (
          <AlertDialog>
            <AlertDialogContent className='bg-white'>
              <AlertDialogTitle>Error</AlertDialogTitle>
              <AlertDialogDescription className='flex items-center gap-2 text-red-600'>
                <AlertCircle className='h-5 w-5' />
                {error}
              </AlertDialogDescription>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {loading ? (
          <div className='flex flex-col justify-center items-center h-96 p-6'>
            <Loader2 className='h-12 w-12 animate-spin text-blue-600 mb-4' />
            <p className='text-gray-600'>Loading customer data...</p>
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
          >
            <TabsList className='grid grid-cols-4 w-full rounded-none bg-gray-100 p-0'>
              <TabsTrigger
                value='customer'
                className='py-4 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none'
              >
                <div className='flex items-center gap-2'>
                  <User className='h-4 w-4' />
                  <span>Customer</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value='shipping'
                className='py-4 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none'
              >
                <div className='flex items-center gap-2'>
                  <MapPin className='h-4 w-4' />
                  <span>Shipping</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value='payment'
                className='py-4 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none'
              >
                <div className='flex items-center gap-2'>
                  <CreditCard className='h-4 w-4' />
                  <span>Payment</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value='review'
                className='py-4 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none'
              >
                <div className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4' />
                  <span>Review</span>
                </div>
              </TabsTrigger>
            </TabsList>

            <ScrollArea className='h-[calc(90vh-160px)]'>
              <FormProvider {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-4'
                >
                  <TabsContent
                    value='customer'
                    className='p-6 pt-4'
                  >
                    <CustomerInfoForm
                      user={
                        user
                          ? { name: user.name, email: user.email }
                          : undefined
                      }
                    />
                    <div className='flex justify-end'>
                      <Button
                        type='button'
                        onClick={() => advanceTab('customer')}
                        className='bg-blue-600 hover:bg-blue-700'
                      >
                        Continue to Shipping
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value='shipping'
                    className='p-6 pt-4'
                  >
                    <ShippingAddressForm />
                    <div className='flex justify-between'>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => setActiveTab('customer')}
                      >
                        Back
                      </Button>
                      <Button
                        type='button'
                        onClick={() => advanceTab('shipping')}
                        className='bg-blue-600 hover:bg-blue-700'
                      >
                        Continue to Payment
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value='payment'
                    className='p-6 pt-4'
                  >
                    <PaymentShippingForm />
                    <div className='flex justify-between'>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => setActiveTab('shipping')}
                      >
                        Back
                      </Button>
                      <Button
                        type='button'
                        onClick={() => advanceTab('payment')}
                        className='bg-blue-600 hover:bg-blue-700'
                      >
                        Continue to Review
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value='review'
                    className='p-6 pt-4 pb-26 '
                  >
                    <OrderReview products={products} />
                    <div className='flex justify-between mt-10 border-t pt-6'>
                      {' '}
                      {/* Increased mt-6 to mt-10 */}
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => setActiveTab('payment')}
                      >
                        Back
                      </Button>
                      <Button
                        type='submit'
                        disabled={submitLoading}
                        className='bg-green-600 hover:bg-green-700 min-w-32 text-white'
                      >
                        {submitLoading ? (
                          <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className='mr-2 h-4 w-4' />
                            Complete Order
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </form>
              </FormProvider>
            </ScrollArea>
          </Tabs>
        )}

        {showBkashPayment && createdOrder && (
          <div className='space-y-4'>
            <div className='bg-gray-50 p-4 rounded'>
              <p className='text-sm text-gray-500'>Order Total</p>
              <p className='text-2xl font-bold'>
                ৳
                {orderData?.products
                  .reduce((acc, curr) => acc + curr.totalPrice.bdt, 0)
                  .toLocaleString()}
              </p>
            </div>
            <BkashPayment order={createdOrder} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderModal;
