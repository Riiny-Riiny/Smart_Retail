import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { SessionProvider } from '@/providers/SessionProvider';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import PWAUpdatePrompt from '@/components/PWAUpdatePrompt';
import OfflineIndicator from '@/components/OfflineIndicator';
import ClientOnly from '@/components/ClientOnly';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Smart Retail - Competitor Intelligence Platform',
  description: 'A modern web application for retail competitor analysis and price monitoring',
  keywords: ['retail', 'competitor analysis', 'price monitoring', 'business intelligence'],
  authors: [{ name: 'Smart Retail Team' }],
  creator: 'Smart Retail',
  publisher: 'Smart Retail',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Smart Retail',
  },
  openGraph: {
    type: 'website',
    siteName: 'Smart Retail',
    title: 'Smart Retail - Competitor Intelligence Platform',
    description: 'A modern web application for retail competitor analysis and price monitoring',
  },
  twitter: {
    card: 'summary',
    title: 'Smart Retail - Competitor Intelligence Platform',
    description: 'A modern web application for retail competitor analysis and price monitoring',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Smart Retail" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        <meta name="msapplication-TileColor" content="#007AFF" />
      </head>
      <body className={`${inter.className} h-full antialiased`}>
        <SessionProvider>
          <ThemeProvider>
            <QueryProvider>
              {children}
            </QueryProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
} 