import { Tabs, TabsList, TabsTrigger } from '@/ui/tabs';
import { cn } from '@/lib/utils';

interface OrderModalTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  formData: {
    customerInfo: boolean;
    shippingInfo: boolean;
    paymentInfo: boolean;
  };
}

export const OrderModalTabs = ({
  activeTab,
  onTabChange,
  formData,
}: OrderModalTabsProps) => {
  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      className='w-full border-b'
    >
      <TabsList className='w-full justify-start rounded-none bg-transparent p-0'>
        <TabsTrigger
          value='customer'
          className={cn(
            'rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-500',
            formData.customerInfo && 'text-green-500'
          )}
        >
          Customer Info
        </TabsTrigger>
        <TabsTrigger
          value='shipping'
          className={cn(
            'rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-500',
            formData.shippingInfo && 'text-green-500'
          )}
        >
          Shipping Info
        </TabsTrigger>
        <TabsTrigger
          value='payment'
          className={cn(
            'rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-500',
            formData.paymentInfo && 'text-green-500'
          )}
        >
          Payment Info
        </TabsTrigger>
        <TabsTrigger
          value='review'
          className='rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-500'
        >
          Review Order
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
