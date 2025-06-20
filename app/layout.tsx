import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/context/AuthProvider';
import ToasterProvider from '@/context/ToasterProvider';
import { cn } from '@/lib/utils';
import { SpeedInsights } from '@vercel/speed-insights/next';
import {
  generateBaseMetadata,
  generateOrganizationStructuredData,
  generateWebsiteStructuredData,
} from '@/lib/seo';
import StructuredData from '@/ui/custom/StructuredData';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = generateBaseMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        {/* Preconnect to external domains for performance */}
        <link
          rel='preconnect'
          href='https://fonts.googleapis.com'
        />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />

        {/* DNS prefetch for external resources */}
        <link
          rel='dns-prefetch'
          href='//www.google-analytics.com'
        />
        <link
          rel='dns-prefetch'
          href='//www.googletagmanager.com'
        />

        {/* Favicon and app icons */}
        <link
          rel='icon'
          href='/favicon.ico'
          sizes='any'
        />
        <link
          rel='icon'
          href='/k2b-logo-2.png'
          type='image/png'
        />
        <link
          rel='apple-touch-icon'
          href='/apple-touch-icon.png'
        />

        {/* Manifest for PWA */}
        <link
          rel='manifest'
          href='/manifest.json'
        />

        {/* Theme color */}
        <meta
          name='theme-color'
          content='#0f172a'
        />
        <meta
          name='msapplication-TileColor'
          content='#0f172a'
        />

        {/* Viewport optimization */}
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, maximum-scale=5'
        />

        {/* Additional SEO meta tags */}
        <meta
          name='format-detection'
          content='telephone=no'
        />
        <meta
          name='mobile-web-app-capable'
          content='yes'
        />
        <meta
          name='apple-mobile-web-app-capable'
          content='yes'
        />
        <meta
          name='apple-mobile-web-app-status-bar-style'
          content='default'
        />
        <meta
          name='apple-mobile-web-app-title'
          content='K2B EXPRESS'
        />

        {/* Structured Data */}
        <StructuredData data={generateOrganizationStructuredData()} />
        <StructuredData data={generateWebsiteStructuredData()} />
      </head>
      <body
        className={cn(
          `${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased bg-background text-foreground`
        )}
      >
        <ToasterProvider />
        <AuthProvider>{children}</AuthProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
