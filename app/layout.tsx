import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import ToastProvider from '@/components/ToastProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'Wealth Pro | Private Wealth Management & Advisory Careers',
  description: 'Institutional-grade financial planning for families. Discover your complete financial picture or explore a career as a licensed financial advisor.',
  keywords: ['financial planning', 'wealth management', 'financial advisor', 'insurance', 'retirement planning'],
  authors: [{ name: 'Wealth Pro' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Wealth Pro',
  },
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    title: 'Wealth Pro | Private Wealth Management',
    description: 'Institutional-grade financial planning for families.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wealth Pro | Private Wealth Management',
    description: 'Institutional-grade financial planning for families.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased font-sans">
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
