'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, User, Mail, Lock, Award, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function SponsorRegister() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [tier, setTier] = useState("Bronze");
    const router = useRouter();
    const { toast } = useToast();

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, tier, role: 'Sponsor' }),
            });

            const result = await res.json();

            if (res.ok) {
                toast({
                    title: "Registration Successful",
                    description: "Please login to continue.",
                });
                router.push('/login?registered=true');
            } else {
                toast({
                    title: "Registration Failed",
                    description: result.error || result.message || "Unknown error",
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
        <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-24 md:py-32 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-purple-900/20 blur-[100px] rounded-full" />
                <div className="absolute bottom-[0%] right-[0%] w-[40%] h-[40%] bg-blue-900/20 blur-[100px] rounded-full" />
            </div>

            <Card className="w-full max-w-lg bg-gray-900/60 backdrop-blur-xl border-white/10 shadow-2xl relative z-10 mx-auto">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                        Sponsor Registration
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Become a partner and support the next generation of innovators
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="companyName" className="text-gray-300">Company Name</Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    id="companyName"
                                    placeholder="Acme Corp"
                                    className="pl-9 bg-gray-950/50 border-gray-800 focus:border-purple-500 transition-colors"
                                    {...register('companyName', { required: 'Company Name is required' })}
                                />
                            </div>
                            {errors.companyName && <p className="text-xs text-red-400">{errors.companyName.message as string}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-300">Contact Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    className="pl-9 bg-gray-950/50 border-gray-800 focus:border-purple-500 transition-colors"
                                    {...register('name', { required: 'Contact Name is required' })}
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
                            <Label htmlFor="password" className="text-gray-300">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-9 bg-gray-950/50 border-gray-800 focus:border-purple-500 transition-colors"
                                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 chars' } })}
                                />
                            </div>
                            {errors.password && <p className="text-xs text-red-400">{errors.password.message as string}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Sponsorship Tier</Label>
                            <Select onValueChange={(val) => setTier(val)} defaultValue="Bronze">
                                <SelectTrigger className="bg-gray-950/50 border-gray-800 focus:ring-purple-500/50">
                                    <div className="flex items-center gap-2">
                                        <Award className="h-4 w-4 text-gray-500" />
                                        <SelectValue placeholder="Select a tier" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Bronze" className="text-amber-700 font-medium">Bronze</SelectItem>
                                    <SelectItem value="Silver" className="text-gray-400 font-medium">Silver</SelectItem>
                                    <SelectItem value="Gold" className="text-yellow-500 font-medium">Gold</SelectItem>
                                    <SelectItem value="Platinum" className="text-cyan-400 font-medium">Platinum</SelectItem>
                                </SelectContent>
                            </Select>
                            {/* Hidden input to register the select value if needed, but we used setValue above. 
                                However, to ensure validation works if we added 'required', we might need to register it differently or use useEffect. 
                                For now, default is Bronze so it's always set.
                            */}
                        </div>

                        <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-6 shadow-lg shadow-purple-900/20 transition-all duration-300">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...
                                </>
                            ) : (
                                <>
                                    Register Sponsor <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-white/5 pt-6">
                    <p className="text-gray-400 text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="text-purple-400 hover:text-purple-300 hover:underline transition-colors font-medium">
                            Login here
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
