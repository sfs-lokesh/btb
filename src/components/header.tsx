
"use client";

import { useContext, useEffect } from 'react';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { PitchContext } from '@/context/PitchContext';
import { useRouter, usePathname } from 'next/navigation';


export function Header() {
  const { isUserAuthenticated, setIsUserAuthenticated } = useContext(PitchContext);
  const router = useRouter();
  const pathname = usePathname();

  // Hide Header on Admin, Manager, and User Dashboard routes
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/manager') || pathname?.startsWith('/dashboard')) {
    return null;
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        if (typeof window.localStorage.getItem === 'function') {
          const token = window.localStorage.getItem('token');
          if (token) {
            setIsUserAuthenticated(true);
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }, [setIsUserAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsUserAuthenticated(false);
    router.push('/');
    router.refresh();
  };

  return (
    <header className="fixed top-0 z-50 w-full p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          {isUserAuthenticated ? (
            <Button onClick={handleLogout} variant="ghost">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          ) : (
            <Button asChild variant="outline" className='glow-border'>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
