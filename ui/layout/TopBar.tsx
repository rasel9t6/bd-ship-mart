'use client';

import { useSession, signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, CircleUserRound } from 'lucide-react';
import { navLinks } from '@/lib/constant';
import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../dropdown-menu';
import { Button } from '../button';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';

export default function TopBar() {
  const [dropdownMenu, setDropdownMenu] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className='sticky top-0 z-50 bg-white shadow-sm lg:hidden'>
      <div className='container mx-auto flex items-center justify-between px-4 py-3 lg:px-6'>
        {/* Logo */}
        <Link
          href='/'
          className='flex items-center'
        >
          <Image
            src='/bd-ship-mart-logo.svg'
            alt='Wave Mart Logo'
            width={50}
            height={60}
            className='h-10 w-auto'
          />
        </Link>

        {/* Mobile Navigation */}
        <div className='flex items-center space-x-4'>
          {/* Mobile Dropdown Menu */}
          <DropdownMenu
            open={dropdownMenu}
            onOpenChange={setDropdownMenu}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
              >
                {dropdownMenu ? (
                  <X className='h-6 w-6' />
                ) : (
                  <Menu className='h-6 w-6' />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              className='w-56'
            >
              {navLinks.map((item, i) => (
                <DropdownMenuItem
                  key={i}
                  asChild
                >
                  <Link
                    href={item.url}
                    className={`flex items-center w-full ${
                      pathname === item.url ? 'text-primary' : ''
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className='ml-2'>{item.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Avatar */}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='p-0'
                >
                  <Avatar>
                    <AvatarImage
                      src={
                        session.user?.profilePicture ||
                        session.user?.image ||
                        undefined
                      }
                      alt={session.user?.name || 'User'}
                    />
                    <AvatarFallback>
                      {session.user?.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel>{session.user?.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  asChild
                  className='hover:bg-bondi-blue-50 hover:text-bondi-blue-700 transition-colors duration-200 rounded-md'
                >
                  <Link href={`/profile/${session.user?.userId}`}>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className='hover:bg-bondi-blue-50 hover:text-bondi-blue-700 transition-colors duration-200 rounded-md'
                >
                  <Link href={`/profile/${session.user?.userId}?tab=orders`}>
                    Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='hover:bg-bondi-blue-50 hover:text-bondi-blue-700 transition-colors duration-200 rounded-md'
                  onClick={() =>
                    signIn('google', { callbackUrl: '/auth/login' })
                  }
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              variant='outline'
              size='sm'
              className='flex items-center gap-2 border-bondi-blue-200 text-bondi-blue-700 hover:bg-bondi-blue-50 hover:text-bondi-blue-700 transition font-medium px-3 py-1'
            >
              <Link href='/auth/login'>
                <CircleUserRound className='size-4' />
                <span className='text-sm'>Sign In</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
