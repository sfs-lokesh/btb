
import type { Metadata } from 'next';
import './globals.css';
import { PitchProvider } from '@/context/PitchContext';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { Suspense } from 'react';
import { Home, Users, Vote, Briefcase } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Behind the Build — India’s First Stage for Freelancers & Innovators',
  description: 'An initiative by GWD Global Pvt. Ltd., Behind the Build is a first-of-its-kind stage event designed to celebrate India’s finest freelancers, creators, and innovators.',
};

if (typeof window === 'undefined') {
  // Polyfill localStorage for server-side
  if (typeof global.localStorage === 'undefined' || typeof global.localStorage.getItem !== 'function') {
    (global as any).localStorage = {
      getItem: () => null,
      setItem: () => { },
      removeItem: () => { },
      clear: () => { },
      key: () => null,
      length: 0,
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className="dark">

      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
        {/* Razorpay Script */}
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </head>

      <body className="font-body antialiased bg-background" suppressHydrationWarning>
        <PitchProvider>
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          {children}
          <Toaster />
        </PitchProvider>
      </body>
    </html>
  );
}
