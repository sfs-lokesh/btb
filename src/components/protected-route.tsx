"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AdminLogin } from '@/components/admin-login';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs only on the client
    const authStatus = sessionStorage.getItem('isAdminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, [pathname]); // Re-check on route change

  // While checking auth status, don't render anything to prevent flash of content
  if (isLoading) {
    return null;
  }
  
  // If authenticated, render the protected children components
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated, show the AdminLogin component
  return <AdminLogin />;
}
