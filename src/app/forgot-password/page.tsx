'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

type FormData = {
    email: string;
};

export default function ForgotPasswordPage() {
    const { register, handleSubmit, formState: { errors }, getValues, reset } = useForm();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(120); // 2 minutes
    const [canResend, setCanResend] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const handleSendOtp = async (data: any) => {
        setLoading(true);
        try {
            const res = await fetch('/api/auth/forgot-password/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: data.email }),
            });
            const result = await res.json();
            if (res.ok) {
                setEmail(data.email);
                setStep(2);
                setTimer(120);
                setCanResend(false);
                toast({ title: "OTP Sent", description: "Please check your email for the OTP." });
            } else {
                toast({ title: "Error", description: result.error || "Email not registered.", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Network error.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (data: any) => {
        setLoading(true);
        try {
            const res = await fetch('/api/auth/forgot-password/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: data.otp }),
            });
            const result = await res.json();
            if (res.ok) {
                setOtp(data.otp);
                setStep(3);
                toast({ title: "Refified", description: "OTP verified successfully." });
            } else {
                toast({ title: "Invalid OTP", description: "You have entered incorrect OTP.", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Verification failed.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (data: any) => {
        if (data.password !== data.confirmPassword) {
            toast({ title: "Mismatch", description: "Passwords do not match.", variant: "destructive" });
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/auth/forgot-password/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword: data.password }),
            });
            const result = await res.json();
            if (res.ok) {
                toast({ title: "Success", description: "Password reset successfully. Redirecting..." });
                setTimeout(() => router.push('/login'), 2000);
            } else {
                toast({ title: "Error", description: result.error || "Failed to reset password.", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const resendOtp = async () => {
        setTimer(120);
        setCanResend(false);
        await handleSendOtp({ email });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4 pt-32 pb-12">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">
                        {step === 1 && "Forgot Password"}
                        {step === 2 && "Enter OTP"}
                        {step === 3 && "Reset Password"}
                    </CardTitle>
                    <CardDescription>
                        {step === 1 && "Enter your email to receive a verification code."}
                        {step === 2 && `Enter the OTP sent to ${email}`}
                        {step === 3 && "Create a new password for your account."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* STEP 1: Email Input */}
                    {step === 1 && (
                        <form onSubmit={handleSubmit(handleSendOtp)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                                    })}
                                />
                                {errors.email && <p className="text-sm text-red-500">{errors.email.message as string}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                                Send OTP
                            </Button>
                        </form>
                    )}

                    {/* STEP 2: OTP Input */}
                    {step === 2 && (
                        <form onSubmit={handleSubmit(handleVerifyOtp)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="otp">One-Time Password</Label>
                                <Input
                                    id="otp"
                                    placeholder="Enter 6-digit OTP"
                                    className="text-center tracking-widest text-lg"
                                    maxLength={6}
                                    {...register('otp', { required: 'OTP is required', minLength: 6 })}
                                />
                                {errors.otp && <p className="text-sm text-red-500">Enter a valid 6-digit OTP</p>}
                            </div>

                            <div className="text-center text-sm">
                                {canResend ? (
                                    <button type="button" onClick={resendOtp} className="text-primary hover:underline font-medium">
                                        Resend OTP
                                    </button>
                                ) : (
                                    <span className="text-muted-foreground">Resend OTP in {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</span>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                                Verify OTP
                            </Button>
                        </form>
                    )}

                    {/* STEP 3: New Password */}
                    {step === 3 && (
                        <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register('password', { required: 'Required', minLength: 6 })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register('confirmPassword', { required: 'Required' })}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                                Reset Password
                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
                        Back to Login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
