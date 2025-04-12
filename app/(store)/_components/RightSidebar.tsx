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
        className='custom-scrollbar sticky right-0 top-0 flex h-screen  flex-col  border-l  border-custom-gray/20 bg-white px-6 pt-28 max-md:hidden sm:w-1/3 lg:w-1/5'
      >
        <div className='flex flex-col gap-2 py-4 pb-8'>
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-4 text-lg font-bold'
          >
            Loading Shipping Costs...
          </motion.h2>
        </div>
      </motion.aside>
    );
  }

  if (error) {
    return (
      <motion.aside
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className='custom-scrollbar sticky right-0 top-0 flex h-screen  flex-col  border-l  border-custom-gray/20 bg-white px-6 pt-28 max-md:hidden sm:w-1/3 lg:w-1/5'
      >
        <div className='flex flex-col gap-2 py-4 pb-8'>
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-4 text-lg font-bold text-red-500'
          >
            Error loading shipping costs
          </motion.h2>
          <p className='text-sm text-gray-600'>{error}</p>
        </div>
      </motion.aside>
    );
  }

  return (
    <>
      <motion.aside
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className='custom-scrollbar sticky right-0 top-0 flex h-screen  flex-col  border-l  border-custom-gray/20 bg-white px-6 pt-28 max-md:hidden sm:w-1/3 lg:w-1/5'
      >
        <div className='flex flex-col gap-2 py-4 pb-8'>
          <div className='flex items-center justify-between'>
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className='text-lg font-bold'
            >
              Shipping Costs
            </motion.h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className='rounded-full p-1 text-gray-500 hover:bg-gray-100'
              title='View all shipping costs'
            >
              <Info className='size-5' />
            </button>
          </div>

          {Object.entries(shippingCosts).map(([categoryKey, category]) => (
            <motion.div
              key={categoryKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className='border-b border-custom-gray/20 pb-2'
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleCategory(categoryKey)}
                className={`flex w-full items-center justify-between py-2 text-sm font-medium transition-colors duration-200 ${
                  expandedCategories[categoryKey]
                    ? 'text-bondi-blue-500'
                    : 'text-gray-700 hover:text-bondi-blue-400'
                }`}
              >
                <span>{category.name}</span>
                <motion.div
                  animate={{ rotate: expandedCategories[categoryKey] ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight
                    className={`size-4 ${
                      expandedCategories[categoryKey]
                        ? 'text-bondi-blue-500'
                        : 'text-gray-700'
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
                    className='ml-4 flex flex-col gap-2 overflow-hidden'
                  >
                    {Object.entries(category.subcategories).map(
                      ([subKey, subCategory], index) => (
                        <motion.div
                          key={subKey}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className='flex flex-col gap-1 py-1 text-sm text-gray-600'
                        >
                          <span className='font-medium'>
                            {subCategory.name}
                          </span>
                          <div className='ml-2 flex flex-col gap-1'>
                            <div className='flex items-center justify-between'>
                              <span className='text-xs'>Air Freight:</span>
                              <span className='text-xs font-medium'>
                                ৳{subCategory.cost.byAir.min} - ৳
                                {subCategory.cost.byAir.max}
                              </span>
                            </div>
                            <div className='flex items-center justify-between'>
                              <span className='text-xs'>Sea Freight:</span>
                              <span className='text-xs font-medium'>
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
        <div className='mb-6 mt-auto rounded-md bg-bondi-blue-50 p-2 text-center font-Noto_Sans_Bengali text-sm font-semibold text-gray-600'>
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
