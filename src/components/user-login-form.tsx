
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

import { useToast } from '@/hooks/use-toast';
import { safeLocalStorage } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export function UserLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Creds, 2: OTP
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLoginInit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Step 1: Check creds and request OTP
      const res = await fetch('/api/auth/login/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.requireOtp) {
        setStep(2);
        toast({
          title: "OTP Sent",
          description: "Please enter the OTP sent to your email.",
        });
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      safeLocalStorage.setItem('token', data.token);

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      // Redirect based on role
      if (data.user.role === 'Admin' || data.user.role === 'SuperAdmin') {
        router.push('/admin');
      } else if (data.user.role === 'Manager') {
        router.push('/manager');
      } else {
        router.push('/dashboard');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background pt-32 pb-12 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            {step === 1 ? "Enter your credentials to access live voting." : "Enter the OTP sent to your email."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={step === 1 ? handleLoginInit : handleVerifyOtp}>
            <div className="grid w-full items-center gap-4">

              {step === 1 && (
                <>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                        Forgot Password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="otp">OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={isLoading}
                    maxLength={6}
                    className="text-center tracking-widest text-lg"
                    required
                  />
                </div>
              )}

              {error && (
                <div className="p-3 bg-destructive/15 border border-destructive/50 rounded-md">
                  <p className="text-sm text-destructive text-center font-medium">{error}</p>
                </div>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button className="w-full" onClick={step === 1 ? handleLoginInit : handleVerifyOtp} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {step === 1 ? 'Login' : 'Verify & Login'}
          </Button>
          <div className="text-center text-xs text-muted-foreground space-y-2">
            <p>
              Don't have an account? <Link href="/register" className="text-primary hover:underline">Register now</Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

