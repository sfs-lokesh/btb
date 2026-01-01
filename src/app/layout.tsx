
import type { Metadata } from 'next';
import './globals.css';
import { PitchProvider } from '@/context/PitchContext';
import { Toaster } from '@/components/ui/toaster';
import { FloatingNav } from '@/components/ui/floating-navbar';
import { Briefcase, Home, Users, Vote } from 'lucide-react';
import { Header } from '@/components/header';


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
  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: <Home className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Register",
      link: "/register/participant",
      icon: <Users className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Live Voting",
      link: "/live-voting",
      icon: <Vote className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Partners",
      link: "/partners",
      icon: <Briefcase className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Stall Bookings",
      link: "/stalls",
      icon: <Briefcase className="h-4 w-4 text-neutral-500 dark:text-white" />,
    }
  ];

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
      </head>
      <body className="font-body antialiased bg-background" suppressHydrationWarning>
        <PitchProvider>
          <Header />
          {children}
          <Toaster />
        </PitchProvider>
      </body>
    </html>
  );
}
