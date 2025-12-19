import type { Metadata } from 'next';
import './globals.css';
import ToastProvider from '@/components/ToastProvider';

export const metadata: Metadata = {
  title: 'Wealth Pro | Private Wealth Management & Advisory Careers',
  description: 'Institutional-grade financial planning for families. Discover your complete financial picture or explore a career as a licensed financial advisor.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-sans">
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
