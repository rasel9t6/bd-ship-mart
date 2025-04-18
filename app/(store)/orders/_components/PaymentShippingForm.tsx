import { useFormContext } from 'react-hook-form';
import { Truck, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { FormField, FormItem, FormLabel, FormMessage } from '@/ui/form';

export const PaymentShippingForm = () => {
  const form = useFormContext();

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Shipping Method */}
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-base flex items-center gap-2'>
              <Truck className='h-4 w-4 text-blue-600' />
              Shipping Method
            </CardTitle>
          </CardHeader>
          <CardContent className='p-4 space-y-4'>
            <FormField
              control={form.control}
              name='shippingMethod'
              render={({ field }) => (
                <FormItem>
                  <div className='grid grid-cols-2 gap-3'>
                    <div
                      className={`border rounded-lg p-3 cursor-pointer flex items-center gap-2 ${
                        field.value === 'air'
                          ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => form.setValue('shippingMethod', 'air')}
                    >
                      <div
                        className={`h-4 w-4 rounded-full border ${
                          field.value === 'air'
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {field.value === 'air' && (
                          <div className='h-2 w-2 rounded-full bg-white m-[3px]' />
                        )}
                      </div>
                      <div>
                        <p className='font-medium'>Air Shipping</p>
                        <p className='text-xs text-gray-500'>
                          Faster delivery (5-7 days)
                        </p>
                      </div>
                    </div>

                    <div
                      className={`border rounded-lg p-3 cursor-pointer flex items-center gap-2 ${
                        field.value === 'sea'
                          ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => form.setValue('shippingMethod', 'sea')}
                    >
                      <div
                        className={`h-4 w-4 rounded-full border ${
                          field.value === 'sea'
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {field.value === 'sea' && (
                          <div className='h-2 w-2 rounded-full bg-white m-[3px]' />
                        )}
                      </div>
                      <div>
                        <p className='font-medium'>Sea Shipping</p>
                        <p className='text-xs text-gray-500'>
                          Economical (20-30 days)
                        </p>
                      </div>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='deliveryType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm text-gray-600'>
                    Delivery Type
                  </FormLabel>
                  <div className='grid grid-cols-2 gap-3'>
                    <div
                      className={`border rounded-lg p-3 cursor-pointer flex items-center gap-2 ${
                        field.value === 'door-to-door'
                          ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() =>
                        form.setValue('deliveryType', 'door-to-door')
                      }
                    >
                      <div
                        className={`h-4 w-4 rounded-full border ${
                          field.value === 'door-to-door'
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {field.value === 'door-to-door' && (
                          <div className='h-2 w-2 rounded-full bg-white m-[3px]' />
                        )}
                      </div>
                      <div>
                        <p className='font-medium'>Door to Door</p>
                        <p className='text-xs text-gray-500'>
                          Direct to customer
                        </p>
                      </div>
                    </div>

                    <div
                      className={`border rounded-lg p-3 cursor-pointer flex items-center gap-2 ${
                        field.value === 'warehouse'
                          ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => form.setValue('deliveryType', 'warehouse')}
                    >
                      <div
                        className={`h-4 w-4 rounded-full border ${
                          field.value === 'warehouse'
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {field.value === 'warehouse' && (
                          <div className='h-2 w-2 rounded-full bg-white m-[3px]' />
                        )}
                      </div>
                      <div>
                        <p className='font-medium'>Warehouse</p>
                        <p className='text-xs text-gray-500'>Customer pickup</p>
                      </div>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-base flex items-center gap-2'>
              <CreditCard className='h-4 w-4 text-blue-600' />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className='p-4 space-y-4'>
            <FormField
              control={form.control}
              name='paymentMethod'
              render={({ field }) => (
                <FormItem>
                  <div className='grid grid-cols-2 gap-3'>
                    <div
                      className={`border rounded-lg p-3 cursor-pointer flex items-center gap-2 ${
                        field.value === 'cash'
                          ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => form.setValue('paymentMethod', 'cash')}
                    >
                      <div
                        className={`h-4 w-4 rounded-full border ${
                          field.value === 'cash'
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {field.value === 'cash' && (
                          <div className='h-2 w-2 rounded-full bg-white m-[3px]' />
                        )}
                      </div>
                      <div>
                        <p className='font-medium'>Cash</p>
                        <p className='text-xs text-gray-500'>Pay on delivery</p>
                      </div>
                    </div>

                    <div
                      className={`border rounded-lg p-3 cursor-pointer flex items-center gap-2 ${
                        field.value === 'card'
                          ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => form.setValue('paymentMethod', 'card')}
                    >
                      <div
                        className={`h-4 w-4 rounded-full border ${
                          field.value === 'card'
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {field.value === 'card' && (
                          <div className='h-2 w-2 rounded-full bg-white m-[3px]' />
                        )}
                      </div>
                      <div>
                        <p className='font-medium'>Card</p>
                        <p className='text-xs text-gray-500'>
                          Credit/Debit card
                        </p>
                      </div>
                    </div>

                    <div
                      className={`border rounded-lg p-3 cursor-pointer flex items-center gap-2 ${
                        field.value === 'bkash'
                          ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => form.setValue('paymentMethod', 'bkash')}
                    >
                      <div
                        className={`h-4 w-4 rounded-full border ${
                          field.value === 'bkash'
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {field.value === 'bkash' && (
                          <div className='h-2 w-2 rounded-full bg-white m-[3px]' />
                        )}
                      </div>
                      <div>
                        <p className='font-medium'>bKash</p>
                        <p className='text-xs text-gray-500'>Mobile payment</p>
                      </div>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='paymentCurrency'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm text-gray-600'>
                    Payment Currency
                  </FormLabel>
                  <div className='grid grid-cols-3 gap-2'>
                    <div
                      className={`border rounded-lg p-3 cursor-pointer flex justify-center items-center ${
                        field.value === 'BDT'
                          ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => form.setValue('paymentCurrency', 'BDT')}
                    >
                      <div className='text-center'>
                        <p className='font-medium text-lg'>৳</p>
                        <p className='text-xs text-gray-600'>BDT</p>
                      </div>
                    </div>

                    <div
                      className={`border rounded-lg p-3 cursor-pointer flex justify-center items-center ${
                        field.value === 'USD'
                          ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => form.setValue('paymentCurrency', 'USD')}
                    >
                      <div className='text-center'>
                        <p className='font-medium text-lg'>$</p>
                        <p className='text-xs text-gray-600'>USD</p>
                      </div>
                    </div>

                    <div
                      className={`border rounded-lg p-3 cursor-pointer flex justify-center items-center ${
                        field.value === 'CNY'
                          ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => form.setValue('paymentCurrency', 'CNY')}
                    >
                      <div className='text-center'>
                        <p className='font-medium text-lg'>¥</p>
                        <p className='text-xs text-gray-600'>CNY</p>
                      </div>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
