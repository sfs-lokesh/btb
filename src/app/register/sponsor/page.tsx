'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Building2, User, Mail, Phone, ArrowRight, Loader2 } from 'lucide-react';

export default function SponsorRequest() {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const res = await fetch('/api/contact/sponsor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (res.ok) {
                toast({
                    title: "Request Sent",
                    description: "Thank you for your interest. We will contact you shortly.",
                });
                reset();
            } else {
                toast({
                    title: "Submission Failed",
                    description: result.error || "Unknown error",
                    variant: "destructive"
                });
            }
        } catch (err) {
            console.error(err);
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-32 md:py-32 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-purple-900/20 blur-[100px] rounded-full" />
                <div className="absolute bottom-[0%] right-[0%] w-[40%] h-[40%] bg-blue-900/20 blur-[100px] rounded-full" />
            </div>

            <Card className="w-full max-w-lg bg-gray-900/60 backdrop-blur-xl border-white/10 shadow-2xl relative z-10 mx-auto">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                        Become a Sponsor
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Leave your details, and we'll get back to you.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="businessName" className="text-gray-300">Business Name</Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    id="businessName"
                                    placeholder="Acme Corp"
                                    className="pl-9 bg-gray-950/50 border-gray-800 focus:border-purple-500 transition-colors"
                                    {...register('businessName', { required: 'Business Name is required' })}
                                />
                            </div>
                            {errors.businessName && <p className="text-xs text-red-400">{errors.businessName.message as string}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-300">Contact Person Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    className="pl-9 bg-gray-950/50 border-gray-800 focus:border-purple-500 transition-colors"
                                    {...register('name', { required: 'Name is required' })}
                                />
                            </div>
                            {errors.name && <p className="text-xs text-red-400">{errors.name.message as string}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@company.com"
                                    className="pl-9 bg-gray-950/50 border-gray-800 focus:border-purple-500 transition-colors"
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" }
                                    })}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-400">{errors.email.message as string}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    id="phone"
                                    placeholder="9876543210"
                                    className="pl-9 bg-gray-950/50 border-gray-800 focus:border-purple-500 transition-colors"
                                    {...register('phone', {
                                        required: 'Phone is required',
                                        pattern: { value: /^[0-9]{10}$/, message: "Must be 10 digits" }
                                    })}
                                    maxLength={10}
                                />
                            </div>
                            {errors.phone && <p className="text-xs text-red-400">{errors.phone.message as string}</p>}
                        </div>

                        <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-6 shadow-lg shadow-purple-900/20 transition-all duration-300">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Request...
                                </>
                            ) : (
                                <>
                                    Send Request <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
