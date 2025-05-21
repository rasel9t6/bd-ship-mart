'use client';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ShippingCostsModal from './ShippingCostsModal';

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

export default function RightSidebar() {
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});
  const [shippingCosts, setShippingCosts] = useState<Record<string, Category>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

    fetchShippingCosts();
  }, []);

  const toggleCategory = (category: string): void => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  if (loading) {
    return (
      <motion.aside
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className='custom-scrollbar sticky right-0 top-0 flex h-screen flex-col border-l !border-bondi-blue bg-white px-6 pt-28 shadow-sm shadow-bondi-blue max-md:hidden sm:w-1/3 lg:w-1/5'
      >
        <div className='flex flex-col gap-2 py-4 pb-8'>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex items-center gap-2'
          >
            <div className='h-4 w-4 animate-pulse rounded-full bg-bondi-blue-200'></div>
            <div className='h-4 w-32 animate-pulse rounded bg-bondi-blue-100'></div>
          </motion.div>
          <div className='mt-4 space-y-3'>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className='space-y-2'
              >
                <div className='h-4 w-3/4 animate-pulse rounded bg-bondi-blue-50'></div>
                <div className='h-3 w-1/2 animate-pulse rounded bg-bondi-blue-50'></div>
              </div>
            ))}
          </div>
        </div>
      </motion.aside>
    );
  }

  if (error) {
    return (
      <motion.aside
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className='custom-scrollbar sticky right-0 top-0 flex h-screen flex-col border-l border-bondi-blue-50/80   bg-white px-6 pt-28  max-md:hidden sm:w-1/3 lg:w-1/5'
      >
        <div className='flex flex-col gap-2 py-4 pb-8'>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='rounded-lg bg-red-50 p-4'
          >
            <h2 className='mb-2 text-lg font-semibold text-red-600'>
              Error loading shipping costs
            </h2>
            <p className='text-sm text-red-500'>{error}</p>
          </motion.div>
        </div>
      </motion.aside>
    );
  }

  return (
    <>
      <motion.aside
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className='custom-scrollbar sticky right-0 top-0 flex h-screen flex-col border-l border-bondi-blue-50/70 bg-white px-6 pt-28 max-md:hidden sm:w-1/3 lg:w-1/5'
      >
        <div className='flex flex-col gap-2 py-4 pb-8'>
          <div className='flex items-center justify-between border-b border-gray-100 pb-4'>
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className='text-lg font-semibold text-gray-900'
            >
              Shipping Costs
            </motion.h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className='rounded-full p-1.5 text-gray-500 transition-colors hover:bg-bondi-blue-50 hover:text-bondi-blue-600'
              title='View all shipping costs'
            >
              <Info className='size-5' />
            </button>
          </div>

          <div className='mt-2 space-y-1'>
            {Object.entries(shippingCosts).map(([categoryKey, category]) => (
              <motion.div
                key={categoryKey}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className='rounded-lg border border-gray-100 bg-white p-2 shadow-sm'
              >
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => toggleCategory(categoryKey)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    expandedCategories[categoryKey]
                      ? 'bg-bondi-blue-50 text-bondi-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{category.name}</span>
                  <motion.div
                    animate={{
                      rotate: expandedCategories[categoryKey] ? 90 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight
                      className={`size-4 ${
                        expandedCategories[categoryKey]
                          ? 'text-bondi-blue-600'
                          : 'text-gray-500'
                      }`}
                    />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {expandedCategories[categoryKey] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className='mt-2 space-y-2 overflow-hidden rounded-md bg-gray-50 p-2'
                    >
                      {Object.entries(category.subcategories).map(
                        ([subKey, subCategory], index) => (
                          <motion.div
                            key={subKey}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className='rounded-md bg-white p-2 shadow-sm'
                          >
                            <span className='block text-sm font-medium text-gray-900'>
                              {subCategory.name}
                            </span>
                            <div className='mt-2 space-y-1.5'>
                              <div className='flex items-center justify-between rounded-md bg-bondi-blue-50 px-2 py-1'>
                                <span className='text-xs font-medium text-bondi-blue-700'>
                                  Air Freight
                                </span>
                                <span className='text-xs font-semibold text-bondi-blue-900'>
                                  ৳{subCategory.cost.byAir.min} - ৳
                                  {subCategory.cost.byAir.max}
                                </span>
                              </div>
                              <div className='flex items-center justify-between rounded-md bg-gray-100 px-2 py-1'>
                                <span className='text-xs font-medium text-gray-700'>
                                  Sea Freight
                                </span>
                                <span className='text-xs font-semibold text-gray-900'>
                                  ৳{subCategory.cost.bySea.min} - ৳
                                  {subCategory.cost.bySea.max}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
        <div className='mb-6 mt-auto rounded-lg bg-bondi-blue-50 p-4 text-center font-Noto_Sans_Bengali text-sm font-semibold text-bondi-blue-700 shadow-sm'>
          আমরাই দিচ্ছি দ্রুত শিপিংয়ের অঙ্গীকার
        </div>
      </motion.aside>

      <ShippingCostsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
