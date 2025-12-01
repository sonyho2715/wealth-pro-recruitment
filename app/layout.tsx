import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wealth Pro | Financial Planning & Career Opportunity',
  description: 'Discover your complete financial picture, get personalized insurance recommendations, and explore a rewarding career as a financial advisor.',
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
