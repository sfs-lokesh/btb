"use client";

import { useContext, useEffect } from 'react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut } from 'lucide-react';
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

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Register", href: "/register/participant" },
    { name: "Live Voting", href: "/live-voting" },
    { name: "Partners", href: "/partners" },
    { name: "Stall Bookings", href: "/stalls" },
  ];

  return (
    <header className="fixed top-0 z-50 w-full p-4 pointer-events-none">
      <div className="container mx-auto flex items-center justify-between pointer-events-auto bg-background/80 backdrop-blur-md border rounded-full shadow-md">
        <Link href="/" className="flex items-center gap-4">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-medium hover:text-primary transition-colors">
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map(link => (
                  <Link key={link.href} href={link.href} className="text-lg font-medium hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                ))}
                {isUserAuthenticated ? (
                  <Button onClick={handleLogout} variant="ghost" className="justify-start px-0">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link href="/login">Login</Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <div className="hidden lg:flex items-center gap-2">
            {isUserAuthenticated ? (
              <Button onClick={handleLogout} variant="ghost" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Button asChild variant="default" size="sm" className="rounded-full px-6">
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
