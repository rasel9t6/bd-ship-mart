'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Button } from '@/ui/button';
import { Loader2, CheckCircle, AlertCircle, Mail } from 'lucide-react';

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<
    'loading' | 'success' | 'error' | 'idle'
  >(token ? 'loading' : 'idle');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Automatically verify if token is present in URL

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function verifyEmail(verificationToken: string) {
    setStatus('loading');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setStatus('success');
      toast.success('Email verified successfully!');

      // Redirect to login after success
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error) {
      setStatus('error');
      toast.error(
        error instanceof Error ? error.message : 'Verification failed'
      );
    }
  }

  async function resendVerification(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification email');
      }

      toast.success('Verification email sent! Please check your inbox.');
      setEmail('');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Something went wrong'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className='flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4'
    >
      <div className='w-full max-w-md rounded-xl bg-white p-8 shadow-lg'>
        <div className='mb-6 flex flex-col items-center'>
          <Image
            src='/bd-ship-mart-logo.svg'
            alt='Bd shipmart logo'
            height={80}
            width={80}
          />

          {status === 'loading' && (
            <>
              <Loader2 className='mt-6 h-12 w-12 animate-spin text-blue-600' />
              <h1 className='mt-4 text-2xl font-bold text-gray-900'>
                Verifying Your Email
              </h1>
              <p className='mt-2 text-center text-gray-500'>
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className='mt-6 h-12 w-12 text-green-600' />
              <h1 className='mt-4 text-2xl font-bold text-gray-900'>
                Email Verified!
              </h1>
              <p className='mt-2 text-center text-gray-500'>
                Your email has been successfully verified. You will be
                redirected to login shortly.
              </p>
              <Button
                className='mt-4'
                onClick={() => router.push('/auth/login')}
              >
                Login Now
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className='mt-6 h-12 w-12 text-red-600' />
              <h1 className='mt-4 text-2xl font-bold text-gray-900'>
                Verification Failed
              </h1>
              <p className='mt-2 text-center text-gray-500'>
                We couldn&apos;t verify your email. The link may be expired or
                invalid.
              </p>
            </>
          )}

          {(status === 'idle' || status === 'error') && (
            <div className='mt-8 w-full'>
              <h2 className='mb-4 text-xl font-semibold text-gray-800'>
                {status === 'idle'
                  ? 'Verify Your Email'
                  : 'Resend Verification Email'}
              </h2>
              <form
                onSubmit={resendVerification}
                className='space-y-4'
              >
                <div>
                  <label
                    htmlFor='email'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Email Address
                  </label>
                  <input
                    id='email'
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                    placeholder='your@email.com'
                    required
                  />
                </div>

                <Button
                  type='submit'
                  className='w-full'
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className='mr-2 h-4 w-4' />
                      Send Verification Email
                    </>
                  )}
                </Button>
              </form>

              <p className='mt-6 text-center text-sm text-gray-500'>
                Already verified?{' '}
                <Link
                  href='/auth/login'
                  className='font-medium text-blue-600 hover:text-blue-500'
                >
                  Login here
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
