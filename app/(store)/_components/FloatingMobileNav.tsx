'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FaHeart, FaHome, FaSearch, FaUser } from 'react-icons/fa';
import { HiShoppingCart } from 'react-icons/hi2';
import useCart from '@/hooks/useCart';

export default function FloatingMobileNav() {
  const pathname = usePathname();
  const cart = useCart();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartItemCount = mounted
    ? cart.products.reduce(
        (sum: number, p: { variants: { quantity: number }[] }) =>
          sum +
          p.variants.reduce(
            (vSum: number, v: { quantity: number }) => vSum + v.quantity,
            0
          ),
        0
      )
    : 0;

  const navItems = [
    {
      path: '/',
      icon: <FaHome size={18} />,
      label: 'Home',
      active: pathname === '/',
    },
    {
      path: '/search',
      icon: <FaSearch size={18} />,
      label: 'Search',
      active: pathname.startsWith('/search'),
    },
    {
      path: '/cart',
      icon: <HiShoppingCart size={18} />,
      label: 'Cart',
      active: pathname === '/cart',
      badge: cartItemCount > 0 ? cartItemCount : undefined,
    },
    {
      path: '/wishlist',
      icon: <FaHeart size={18} />,
      label: 'Wishlist',
      active: pathname === '/wishlist',
    },
    {
      path: session ? `/profile/${session.user?.userId}` : '/auth/login',
      icon: <FaUser size={18} />,
      label: 'Profile',
      active: pathname.startsWith('/profile') || pathname.startsWith('/auth'),
    },
  ];

  return (
    <nav className='md:hidden fixed bottom-0 left-0 right-0 z-50 px-2 sm:px-4 pb-4'>
      <div className='mx-auto w-full max-w-xs sm:max-w-sm'>
        <div className='flex items-center justify-between bg-white rounded-full shadow-xl border border-gray-200 px-2 sm:px-3 py-3'>
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`relative flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all duration-200 ${
                item.active
                  ? 'bg-bondi-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-bondi-blue-600 hover:bg-bondi-blue-50'
              }`}
            >
              {item.icon}
              <span className='text-[9px] sm:text-[10px] mt-0.5 font-medium leading-tight'>
                {item.label}
              </span>

              {/* Cart badge */}
              {item.badge && item.path === '/cart' && (
                <span className='absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-blaze-orange-500 text-white text-center text-[9px] sm:text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5'>
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
