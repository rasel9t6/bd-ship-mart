import Image from 'next/image';
import Link from 'next/link';
import {
  FaSquareFacebook,
  FaSquareWhatsapp,
  FaSquareYoutube,
} from 'react-icons/fa6';

export default function FooterPage() {
  return (
    <footer className='z-50 bg-gray-900 text-white'>
      <div className='mx-auto max-w-7xl px-4 pb-12 pt-6'>
        {/* Logo */}
        <div className='flex justify-center'>
          <Image
            src='/k2b-logo-2.png'
            alt='K2B EXPRESS'
            width={150}
            height={40}
            className='mx-auto'
          />
        </div>

        {/* Footer Links */}
        <div className='mt-8 grid grid-cols-1 gap-8 text-center sm:grid-cols-2 md:grid-cols-4 md:gap-2 md:text-left lg:grid-cols-4'>
          <div>
            <h3 className='mb-4 text-xl font-bold'>INFORMATION</h3>
            <ul className='space-y-2 text-gray-400'>
              <li>
                <a href='#'>About Us</a>
              </li>
              <li>
                <a href='#'>Privacy Policy</a>
              </li>
              <li>
                <a href='#'>Terms & Conditions</a>
              </li>
              <li>
                <a href='#'>Return & Refund Policy</a>
              </li>
              <li>
                <a href='#'>Prohibited Items</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='mb-4 text-xl font-bold'>CUSTOMER SERVICE</h3>
            <ul className='space-y-2 text-gray-400'>
              <li>
                <a href='#'>Shipping & Delivery</a>
              </li>
              <li>
                <a href='#'>Order Tracking</a>
              </li>
              <li>
                <a href='#'>Payment Methods</a>
              </li>
              <li>
                <a href='#'>Report an Issue</a>
              </li>
              <li>
                <a href='#'>FAQ</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='mb-4 text-xl font-bold'>SHIPPING SERVICES</h3>
            <ul className='space-y-2 text-gray-400'>
              <li>
                <a href='#'>Air Freight</a>
              </li>
              <li>
                <a href='#'>Sea Freight</a>
              </li>
              <li>
                <a href='#'>Express Delivery</a>
              </li>
              <li>
                <a href='#'>Custom Clearance</a>
              </li>
              <li>
                <a href='#'>Warehousing</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='mb-4 text-xl font-bold'>CONTACT US</h3>
            <ul className='space-y-2 text-gray-400'>
              <li>
                <a href='tel:+880-XXX-XXX-XXXX'>+880-XXX-XXX-XXXX</a>
              </li>
              <li>
                <a href='mailto:info@k2bexpress.com'>info@k2bexpress.com</a>
              </li>
              <li>Dhaka, Bangladesh</li>
              <li className='group flex w-full items-center justify-center gap-4 md:justify-start'>
                <Link
                  href='#'
                  className='transition-colors hover:text-blue-500'
                >
                  <FaSquareFacebook size={24} />
                </Link>
                <Link
                  href='#'
                  className='transition-colors hover:text-green-500'
                >
                  <FaSquareWhatsapp size={24} />
                </Link>
                <Link
                  href='#'
                  className=' transition-colors hover:text-red-500'
                >
                  <FaSquareYoutube size={24} />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className='mt-8 border-t border-gray-800 pt-6 text-center text-gray-400'>
          <p>
            &copy; {new Date().getFullYear()} K2B EXPRESS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
