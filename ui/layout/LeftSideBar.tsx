'use client';

import { useSession, signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navLinks } from '@/lib/constant';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../dropdown-menu';
import { Button } from '../button';
import { CircleUserRound } from 'lucide-react';

export default function LeftSideBar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className='fixed left-0 top-0 z-40 h-screen w-64 flex-col bg-white shadow-lg max-lg:hidden'>
      <div className='flex flex-col p-6'>
        {/* Logo */}
        <Link
          href='/'
          className='mb-10 flex justify-center'
        >
          <Image
            src='/bd-ship-mart-logo.svg'
            alt='logo'
            width={120}
            height={80}
            className='h-16 w-auto'
          />
        </Link>

        {/* Navigation Links */}
        <nav className='space-y-2'>
          <TooltipProvider>
            {navLinks.map((link) => (
              <Tooltip key={link.label}>
                <TooltipTrigger asChild>
                  <Link
                    href={link.url}
                    className={`group flex items-center rounded-md p-3 transition-all hover:bg-accent ${
                      pathname === link.url
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-white'
                    }`}
                  >
                    <span className='mr-3'>{link.icon}</span>
                    <span className='text-sm font-medium'>{link.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side='right'>{link.label}</TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>

        {/* Profile Section */}
        <div className='mt-auto border-t pt-6'>
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='flex h-auto w-full items-center space-x-4 p-3  text-primary hover:bg-bondi-blue/10'
                >
                  <Avatar className='h-10 w-10'>
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
                  <div className='flex-1 text-left'>
                    <p className='text-sm font-medium text-bondi-blue-700 '>
                      {session.user?.name}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      View Profile
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='start'
                className='w-56'
              >
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
              className='flex w-full items-center space-x-4 p-3 border-bondi-blue-200 text-bondi-blue-700 hover:bg-bondi-blue-50 hover:text-bondi-blue-700 transition'
            >
              <Link href='/auth/login'>
                <CircleUserRound className='h-5 w-5' />
                <div className='flex-1 text-left'>
                  <p className='text-sm font-medium'>Sign In</p>
                  <p className='text-xs text-muted-foreground'>
                    Access your account
                  </p>
                </div>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
