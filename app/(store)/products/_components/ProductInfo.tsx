'use client';
import { MinusCircle, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import HeartFavorite from './HeartFavorite';
import Image from 'next/image';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import useCart from '@/hooks/useCart';
import { ProductType } from '@/types/next-utils';
import OrderModal from '../../orders/_components/OrderModal';
import { useSession } from 'next-auth/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table';

type OrderItem = {
  color: string;
  size: string;
  quantity: number;
};

// Define an interface for order data that will be passed to the modal
interface OrderData {
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
  subTotal: {
    cny: number;
    usd: number;
    bdt: number;
  };
}

export default function ProductInfo({
  productInfo,
}: {
  productInfo: ProductType;
}) {
  const cart = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const minOrderQty = productInfo.minimumOrderQuantity || 1;
  const { data: session } = useSession();
  // State for order data to pass to modal
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  // Initialize order items with color variants and ZERO quantity
  const [orderItems, setOrderItems] = useState<OrderItem[]>(
    (productInfo.colors || []).map((color) => ({
      color: color.url,
      size: (productInfo.sizes || [])[0] || 'Default',
      quantity: 0,
    }))
  );

  // Calculate total quantity
  const totalQuantity = orderItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Get price based on total quantity
  const getPriceForQuantity = (quantity: number) => {
    const ranges = productInfo.quantityPricing?.ranges || [];
    let selectedPrice = productInfo.price.bdt; // Default to base price

    // Loop through ranges to find the matching one
    for (const range of ranges) {
      if (
        quantity >= range.minQuantity &&
        (!range.maxQuantity || quantity <= range.maxQuantity)
      ) {
        selectedPrice = range.price.bdt;
        break;
      }
    }

    return selectedPrice;
  };

  // Get the updated price per unit based on quantity
  const selectedPrice = getPriceForQuantity(totalQuantity);

  // Update quantity safely
  const updateQuantity = (index: number, change: number) => {
    setOrderItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index] = {
        ...updatedItems[index],
        quantity: Math.max(updatedItems[index].quantity + change, 0),
      };
      return updatedItems;
    });
  };

  // Handle manual quantity input
  const handleQuantityInput = (index: number, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setOrderItems((prevItems) => {
        const updatedItems = [...prevItems];
        updatedItems[index] = {
          ...updatedItems[index],
          quantity: numValue,
        };
        return updatedItems;
      });
    }
  };

  // Prepare order data from the current items
  const prepareOrderData = () => {
    // Only include items with quantity > 0
    const validItems = orderItems.filter((item) => item.quantity > 0);

    // Get price per unit based on total quantity
    const unitPrice = {
      bdt: selectedPrice,
      cny: productInfo.price.cny,
      usd: productInfo.price.usd,
    };

    // Calculate subtotal
    const subTotal = {
      bdt: 0,
      cny: 0,
      usd: 0,
    };

    // Prepare products array for order data
    const products = validItems.map((item) => {
      // Calculate total price for this item
      const itemTotalPrice = {
        bdt: unitPrice.bdt * item.quantity,
        cny: unitPrice.cny * item.quantity,
        usd: unitPrice.usd * item.quantity,
      };

      // Add to subtotal
      subTotal.bdt += itemTotalPrice.bdt;
      subTotal.cny += itemTotalPrice.cny;
      subTotal.usd += itemTotalPrice.usd;

      return {
        product: productInfo._id,
        color: [item.color],
        size: [item.size],
        quantity: item.quantity,
        unitPrice: unitPrice,
        totalPrice: itemTotalPrice,
      };
    });

    return {
      products,
      subTotal,
    };
  };

  // Add to cart with minimum quantity validation
  const addToCart = () => {
    if (totalQuantity < minOrderQty) {
      toast.error(`Minimum order quantity is ${minOrderQty} units.`);
      return;
    }

    orderItems.forEach((item) => {
      if (item.quantity > 0) {
        cart.addItem({
          item: productInfo as ProductType & { _id: string },
          quantity: item.quantity,
          color: item.color,
          size: item.size,
        });
      }
    });

    toast.success('Added to cart!');
    setOrderItems(orderItems.map((item) => ({ ...item, quantity: 0 })));
  };

  // Handle Order Now
  const handleOrderNow = () => {
    if (!session?.user?.id) {
      toast.error('Please login to place an order');
      return;
    }

    if (totalQuantity < minOrderQty) {
      toast.error(`Minimum order quantity is ${minOrderQty} units.`);
      return;
    }

    // Prepare the order data to pass to the modal
    const preparedOrderData = prepareOrderData();
    setOrderData(preparedOrderData);

    // Add to cart and open modal
    addToCart();
    setTimeout(() => setIsModalOpen(true), 300);
  };

  return (
    <motion.div
      className='flex flex-col gap-6 rounded-lg bg-white p-6 shadow-md'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Product Title & Wishlist */}
      <motion.div
        className='flex items-center justify-between'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className='text-2xl font-bold text-gray-900'>
          {productInfo.title}
        </h1>
        <HeartFavorite product={productInfo} />
      </motion.div>

      {/* SKU & Category */}
      <motion.div
        className='flex flex-col space-y-2 text-gray-600'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div>
          <strong>SKU:</strong> {productInfo.sku}
        </div>
        <div>
          <strong>Category:</strong>{' '}
          {typeof productInfo.category === 'object'
            ? productInfo.category.name
            : productInfo.category}
        </div>
      </motion.div>

      {/* Price Display */}
      <motion.div
        className='space-y-2'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className='text-2xl font-extrabold text-blaze-orange'>
          ৳ {selectedPrice}{' '}
          <span className='text-sm text-gray-500'>per unit</span>
        </p>
        <div className='flex gap-4 text-sm text-gray-600'>
          <span>CNY: ¥{productInfo.price.cny}</span>
          <span>USD: ${productInfo.price.usd}</span>
        </div>
      </motion.div>

      {/* Minimum Order Notice */}
      <motion.div
        className='rounded-md bg-gray-100 p-3 text-gray-700'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <strong>Minimum Order:</strong> {minOrderQty} units
      </motion.div>

      {/* Quantity Pricing Table */}
      {productInfo.quantityPricing?.ranges && (
        <motion.div
          className='space-y-4'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className='text-lg font-semibold text-gray-900'>
            Quantity Pricing
          </h3>
          <div className='grid gap-4 sm:grid-cols-2'>
            {productInfo.quantityPricing.ranges.map((range, index) => (
              <div
                key={index}
                className='rounded-lg border p-4 text-center shadow-sm'
              >
                <p className='text-xl font-bold text-gray-900'>
                  ৳{range.price.bdt}
                </p>
                <p className='text-sm text-gray-600'>
                  {range.minQuantity}
                  {range.maxQuantity ? `-${range.maxQuantity}` : '+'} Pcs
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Product Variants Table */}
      <motion.div
        className='overflow-x-auto'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Color</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className='text-center'>Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderItems.map((item, index) => (
              <motion.tr
                key={index}
                className='border-t'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <div className='relative h-8 w-8 overflow-hidden rounded-full'>
                      <Image
                        src={item.color}
                        alt='Color Variant'
                        fill
                        className='object-cover'
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className='text-gray-800'>{item.size}</TableCell>
                <TableCell className='text-center'>
                  <div className='flex items-center justify-center gap-2'>
                    <motion.button
                      onClick={() => updateQuantity(index, -1)}
                      className='rounded-full bg-gray-200 p-2 hover:bg-gray-300'
                      whileTap={{ scale: 0.9 }}
                      disabled={item.quantity <= 0}
                    >
                      <MinusCircle
                        size={20}
                        className={`${
                          item.quantity <= 0 ? 'text-gray-400' : 'text-gray-700'
                        }`}
                      />
                    </motion.button>

                    <motion.input
                      type='number'
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityInput(index, e.target.value)
                      }
                      className='w-16 appearance-none rounded-md border border-gray-300 p-1 text-center text-lg font-semibold [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                      min={0}
                      initial={{ scale: 1 }}
                      animate={{ scale: 1 }}
                      whileFocus={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    />

                    <motion.button
                      onClick={() => updateQuantity(index, 1)}
                      className='rounded-full bg-gray-200 p-2 hover:bg-gray-300'
                      whileTap={{ scale: 0.9 }}
                    >
                      <PlusCircle
                        size={20}
                        className='text-gray-700'
                      />
                    </motion.button>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className='flex flex-col gap-4 pt-4 md:flex-row'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <motion.button
          className={`w-full rounded-lg py-3 text-lg font-bold text-white transition md:w-1/2 ${
            totalQuantity < minOrderQty
              ? 'cursor-not-allowed bg-gray-400'
              : 'bg-blaze-orange hover:bg-blaze-orange-600'
          }`}
          onClick={addToCart}
          disabled={totalQuantity < minOrderQty}
          whileHover={totalQuantity >= minOrderQty ? { scale: 1.03 } : {}}
          whileTap={totalQuantity >= minOrderQty ? { scale: 0.97 } : {}}
        >
          Add To Cart
        </motion.button>
        <motion.button
          className={`w-full rounded-lg py-3 text-lg font-bold text-white transition md:w-1/2 ${
            totalQuantity < minOrderQty
              ? 'cursor-not-allowed bg-gray-400'
              : 'bg-bondi-blue-600 hover:bg-bondi-blue-700'
          }`}
          onClick={handleOrderNow}
          disabled={totalQuantity < minOrderQty}
          whileHover={totalQuantity >= minOrderQty ? { scale: 1.03 } : {}}
          whileTap={totalQuantity >= minOrderQty ? { scale: 0.97 } : {}}
        >
          Order Now
        </motion.button>
      </motion.div>

      {/* Minimum Order Quantity Warning */}
      {totalQuantity > 0 && totalQuantity < minOrderQty && (
        <motion.div
          className='mt-4 rounded-md bg-red-50 p-3 text-red-600'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          You must order at least {minOrderQty} units to place an order.
        </motion.div>
      )}

      {/* Order Modal */}
      {isModalOpen && (
        <OrderModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          userId={session?.user?.id}
          orderData={orderData}
          productInfo={productInfo}
        />
      )}
    </motion.div>
  );
}
