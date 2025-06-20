import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/context/AuthProvider';
import ToasterProvider from '@/context/ToasterProvider';
import { cn } from '@/lib/utils';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { generateBaseMetadata } from '@/lib/seo';
import OrganizationJsonLd from '@/components/seo/OrganizationJsonLd';
import WebsiteJsonLd from '@/components/seo/WebsiteJsonLd';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
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
        <OrganizationJsonLd />
        <WebsiteJsonLd />
      </head>
      <body
        className={cn(
          `${inter.variable} ${montserrat.variable} antialiased bg-background text-foreground`
        )}
      >
        <ToasterProvider />
        <AuthProvider>{children}</AuthProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
