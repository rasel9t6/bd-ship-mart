'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/lib/seo';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label='Breadcrumb'
      className={cn(
        'flex items-center space-x-1 text-sm text-muted-foreground',
        className
      )}
    >
      <ol className='flex items-center space-x-1'>
        {items.map((item, index) => (
          <li
            key={item.href}
            className='flex items-center'
          >
            {index > 0 && (
              <ChevronRight className='mx-1 h-4 w-4 text-muted-foreground/50' />
            )}

            {item.current ? (
              <span
                className='font-medium text-foreground'
                aria-current='page'
              >
                {item.name === 'Home' ? (
                  <Home className='h-4 w-4' />
                ) : (
                  item.name
                )}
              </span>
            ) : (
              <Link
                href={item.href}
                className='hover:text-foreground transition-colors duration-200 flex items-center gap-1'
              >
                {item.name === 'Home' ? (
                  <Home className='h-4 w-4' />
                ) : (
                  item.name
                )}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
