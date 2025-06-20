'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/ui/form';
import { Input } from '@/ui/input';
import { FaGoogle } from 'react-icons/fa6';

// Zod Schema for form validation
const formSchema = z
  .object({
    name: z.string().min(2, {
      message: 'Name must be at least 2 characters.',
    }),
    email: z.string().email({
      message: 'Invalid email address.',
    }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message:
            'Password must include uppercase, lowercase, number, and special character',
        }
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function SignUp() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Define the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setServerError(null);

    // Show loading toast
    const loadingToast = toast.loading('Processing your request...', {
      style: { backgroundColor: '#f59e0b', color: 'white' },
    });

    try {
      // Register user using fetch
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      // Registration successful
      toast.success('Registration successful! Please verify your email.');
      toast.remove(loadingToast);

      // Redirect to verification page with email pre-filled
      router.push(
        `/auth/verify?email=${encodeURIComponent(values.email.trim().toLowerCase())}`
      );
    } catch (error: unknown) {
      // Handle errors
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';

      setServerError(errorMessage);
      toast.error(errorMessage);
      toast.remove(loadingToast);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className='flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4'
    >
      <motion.div
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        className='w-full max-w-md rounded-xl bg-white p-8 shadow-lg'
      >
        <motion.div
          variants={itemVariants}
          className='mb-6 flex flex-col items-center'
        >
          <div className='flex justify-center'>
            <Image
              src='/k2b-logo-2.png'
              alt='K2B EXPRESS logo'
              width={150}
              height={40}
              className='mx-auto'
            />
          </div>

          <h1 className='mb-6 text-center text-2xl font-bold text-gray-900'>
            Join K2B EXPRESS
          </h1>
          <p className='text-center text-gray-500'>
            Create your account to get started
          </p>
        </motion.div>

        <AnimatePresence>
          {serverError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className='mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600'
            >
              {serverError}
            </motion.div>
          )}
        </AnimatePresence>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='John Doe'
                        {...field}
                        autoComplete='name'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='your@email.com'
                        {...field}
                        autoComplete='email'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              variants={itemVariants}
              className='relative'
            >
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder='••••••••'
                          {...field}
                          autoComplete='new-password'
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => setShowPassword(!showPassword)}
                          className='absolute right-0 top-1/2 -translate-y-1/2 transform'
                        >
                          {showPassword ? (
                            <EyeOff className='h-4 w-4' />
                          ) : (
                            <Eye className='h-4 w-4' />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Must be at least 8 characters with uppercase, lowercase,
                      number, and special character
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              variants={itemVariants}
              className='relative'
            >
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder='••••••••'
                          {...field}
                          autoComplete='new-password'
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className='absolute right-0 top-1/2 -translate-y-1/2 transform'
                        >
                          {showConfirmPassword ? (
                            <EyeOff className='h-4 w-4' />
                          ) : (
                            <Eye className='h-4 w-4' />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type='submit'
                className='w-full'
              >
                Create Account
              </Button>
            </motion.div>
          </form>
        </Form>

        <motion.div
          variants={itemVariants}
          className='relative my-6'
        >
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-300'></div>
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='bg-white px-2 text-gray-500'>Or sign up with</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            variant='outline'
            className='w-full'
            onClick={() => signIn('google', { callbackUrl: '/' })}
          >
            <FaGoogle className='mr-2 h-4 w-4' />
            Sign up with Google
          </Button>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className='mt-6 text-center text-sm text-gray-500'
        >
          Already have an account?{' '}
          <Link
            href='/auth/login'
            className='font-medium text-blue-600 hover:text-blue-500'
          >
            Login here
          </Link>
          .
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
