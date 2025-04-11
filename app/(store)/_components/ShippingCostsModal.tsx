'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ShippingCost {
  byAir: { min: number; max: number };
  bySea: { min: number; max: number };
}

interface SubCategory {
  name: string;
  cost: ShippingCost;
}

interface Category {
  name: string;
  cost: null;
  subcategories: Record<string, SubCategory>;
}

interface ShippingCostsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShippingCostsModal({
  isOpen,
  onClose,
}: ShippingCostsModalProps) {
  const [shippingCosts, setShippingCosts] = useState<Record<string, Category>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShippingCosts = async () => {
      try {
        const response = await fetch('/api/shipping-costs');
        if (!response.ok) {
          throw new Error('Failed to fetch shipping costs');
        }
        const data = await response.json();
        setShippingCosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchShippingCosts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className='relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl'
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className='absolute right-4 top-4 rounded-full p-1 text-gray-500 hover:bg-gray-100'
          >
            <X className='size-5' />
          </button>

          <h2 className='mb-6 text-2xl font-bold'>Shipping Costs</h2>

          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='h-8 w-8 animate-spin rounded-full border-4 border-bondi-blue-500 border-t-transparent'></div>
            </div>
          ) : error ? (
            <div className='rounded-md bg-red-50 p-4 text-red-500'>
              <p className='font-medium'>Error loading shipping costs</p>
              <p className='text-sm'>{error}</p>
            </div>
          ) : (
            <div className='space-y-6'>
              {Object.entries(shippingCosts).map(([categoryKey, category]) => (
                <div
                  key={categoryKey}
                  className='rounded-lg border border-gray-200 p-4'
                >
                  <h3 className='mb-3 text-lg font-semibold text-bondi-blue-600'>
                    {category.name}
                  </h3>
                  <div className='grid gap-4 md:grid-cols-2'>
                    {Object.entries(category.subcategories).map(
                      ([subKey, subCategory]) => (
                        <div
                          key={subKey}
                          className='rounded-md bg-gray-50 p-3'
                        >
                          <h4 className='mb-2 font-medium text-gray-900'>
                            {subCategory.name}
                          </h4>
                          <div className='space-y-2'>
                            <div className='flex items-center justify-between rounded-md bg-white p-2'>
                              <span className='text-sm text-gray-600'>
                                Air Freight
                              </span>
                              <span className='text-sm font-medium'>
                                ৳{subCategory.cost.byAir.min} - ৳
                                {subCategory.cost.byAir.max}
                              </span>
                            </div>
                            <div className='flex items-center justify-between rounded-md bg-white p-2'>
                              <span className='text-sm text-gray-600'>
                                Sea Freight
                              </span>
                              <span className='text-sm font-medium'>
                                ৳{subCategory.cost.bySea.min} - ৳
                                {subCategory.cost.bySea.max}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className='mt-6 rounded-md bg-bondi-blue-50 p-3 text-center font-Noto_Sans_Bengali text-sm font-semibold text-gray-600'>
            আমরাই দিচ্ছি দ্রুত শিপিংয়ের অঙ্গীকার
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
