'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Edit, Save, LogOut } from 'lucide-react';
import { useContext } from 'react';
import { PitchContext } from '@/context/PitchContext';
import { PitchCard } from '@/components/pitch-card';
import { LiveVotingPanel } from '@/components/LiveVotingPanel';
import { Logo } from '@/components/logo';
import { safeLocalStorage } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function UserDashboard() {
    const router = useRouter();
    const { pitches } = useContext(PitchContext);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [updating, setUpdating] = useState(false);
    const { toast } = useToast();

    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

    // Load Razorpay Script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            // cleanup if needed
        };
    }, []);

    const handlePayment = async () => {
        if (!user) return;

        // Default or fetched price
        const amountToPay = user.ticketPrice || 1800; // Fallback if ticket fetch fails

        try {
            // Create Order
            const orderRes = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: amountToPay,
                    currency: 'INR',
                    receipt: `receipt_${user._id}`
                }),
            });

            const orderData = await orderRes.json();

            if (!orderData.success) {
                toast({
                    title: "Payment Error",
                    description: "Could not create payment order. Please try again.",
                    variant: "destructive"
                });
                return;
            }

            // Open Razorpay
            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Behind The Build",
                description: "Event Registration Payment",
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    // Verify Payment
                    const verifyRes = await fetch('/api/payment/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            userId: user._id
                        }),
                    });

                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                        toast({
                            title: "Payment Successful!",
                            description: "Your registration is now complete.",
                        });
                        // Refresh user data
                        fetchUser();
                    } else {
                        toast({
                            title: "Payment verification failed",
                            description: verifyData.message,
                            variant: "destructive"
                        });
                    }
                },
                prefill: {
                    name: user.name || '',
                    email: user.email || '',
                    contact: user.phone || ''
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response: any) {
                toast({
                    title: "Payment Failed",
                    description: response.error.description,
                    variant: "destructive"
                });
            });
            rzp1.open();

        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Something went wrong initializing payment.",
                variant: "destructive"
            });
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const token = safeLocalStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const res = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                setFormData(data.user);
            } else {
                safeLocalStorage.removeItem('token');
                router.push('/login');
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        setUpdating(true);
        try {
            const token = safeLocalStorage.getItem('token');
            let body;
            const headers: any = { 'Authorization': `Bearer ${token}` };

            if (profileImageFile) {
                const formDataPayload = new FormData();
                formDataPayload.append('profileImage', profileImageFile);
                Object.keys(formData).forEach(key => {
                    if (key === 'profileImage') return;
                    if (key === 'teamMembers' && Array.isArray(formData[key])) {
                        formDataPayload.append(key, formData[key].join(', '));
                    } else if (formData[key] !== null && formData[key] !== undefined) {
                        formDataPayload.append(key, formData[key] as string);
                    }
                });
                body = formDataPayload;
            } else {
                headers['Content-Type'] = 'application/json';
                // Clean formData to remove base64 image if it exists in state somehow preventing huge payload? 
                // Actually formData is initialized from user which has profileImage base64. 
                // We shouldn't send it back in JSON if we didn't change it, or if we did, we send file.
                // If we send JSON, we probably should exclude profileImage string to save bandwidth/confusion.
                const { profileImage, ...rest } = formData;
                body = JSON.stringify(rest);
            }

            const res = await fetch('/api/auth/me', {
                method: 'PATCH',
                headers,
                body
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                setFormData(data.user);
                setProfileImageFile(null); // Reset file input
                setIsEditOpen(false);
                alert('Profile updated successfully!');
            } else {
                const errData = await res.json().catch(() => ({}));
                alert(`Failed to update profile: ${errData.error || errData.message || 'Unknown error'}`);
            }
        } catch (error: any) {
            console.error('Error updating profile:', error);
            alert(`Network error: ${error.message}`);
        } finally {
            setUpdating(false);
        }
    };

    const handleLogout = () => {
        safeLocalStorage.removeItem('token');
        router.push('/login');
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin w-8 h-8" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 border-b">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Logo />
                        <span className="font-bold text-xl hidden sm:inline-block">Dashboard</span>
                    </div>
                    <Button variant="outline" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" /> Logout
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 space-y-6">
                {user.paymentStatus === 'Pending' && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 flex justify-between items-center" role="alert">
                        <div>
                            <p className="font-bold">Registration Incomplete</p>
                            <p>Your payment is pending. Please complete payment to confirm your registration.</p>
                        </div>
                        <Button onClick={handlePayment} variant="default" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                            Pay Now
                        </Button>
                    </div>
                )}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">My Profile</h1>
                    <Button onClick={() => setIsEditOpen(true)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit Profile
                    </Button>
                </div>

                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="mb-6">
                        <TabsTrigger value="profile">My Profile</TabsTrigger>
                        <TabsTrigger value="voting">Live Voting</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* User Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Personal Info</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-4 mb-4">
                                        {user.profileImage ? (
                                            <img src={user.profileImage} alt="Profile" className="w-20 h-20 rounded-full object-cover border" />
                                        ) : (
                                            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold">
                                                {user.name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-muted-foreground">Name</Label>
                                            <div className="font-medium text-lg">{user.name}</div>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Email</Label>
                                            <div className="font-medium">{user.email}</div>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Phone</Label>
                                            <div className="font-medium">{user.phone || '-'}</div>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Role</Label>
                                            <div className="font-medium">{user.role}</div>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">College</Label>
                                            <div className="font-medium">{user.collegeName || user.collegeId?.name || user.college || '-'}</div>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Payment Status</Label>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${user.paymentStatus === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {user.paymentStatus}
                                            </span>
                                        </div>

                                    </div>
                                </CardContent>
                            </Card>

                            {/* Project Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Project & Team</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-muted-foreground">Project Title</Label>
                                        <div className="font-medium text-lg">{user.projectTitle || 'Not set'}</div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Category</Label>
                                        <div className="font-medium">{user.category || '-'}</div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Description</Label>
                                        <div className="text-sm mt-1">{user.projectDescription || '-'}</div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Project Links</Label>
                                        <div className="mt-1">
                                            {user.projectLinks ? <a href={user.projectLinks} target="_blank" className="text-blue-600 hover:underline">{user.projectLinks}</a> : '-'}
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t">
                                        <Label className="text-muted-foreground block mb-2">Team Structure ({user.teamType || 'Solo'})</Label>
                                        {user.teamName && <div className="text-sm font-semibold mb-2 text-primary">{user.teamName}</div>}
                                        <div className="flex flex-wrap gap-2">
                                            {user.teamMembers && user.teamMembers.length > 0 ? (
                                                user.teamMembers.map((m: string, i: number) => (
                                                    <span key={i} className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm">{m}</span>
                                                ))
                                            ) : <span>No team members</span>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Uploaded Docs & Coupon */}
                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>Documents & Registration</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <Label className="text-muted-foreground">Coupon Used</Label>
                                            <div className="font-mono text-lg mt-1">{user.couponUsed || 'None'}</div>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">QR Code Status</Label>
                                            {user.paymentStatus === 'Completed' ? (
                                                <>
                                                    <div className={`mt-1 font-bold ${user.ticketStatus === 'Used' ? 'text-green-600' : 'text-blue-600'}`}>
                                                        {user.ticketStatus === 'Used' ? 'Scanned Successfully' : 'Ready to Scan'}
                                                    </div>

                                                    {user.qrCode ? (
                                                        <div className="mt-2">
                                                            <img
                                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(user.qrCode)}`}
                                                                alt="Participant QR Code"
                                                                className="w-32 h-32 border rounded-lg"
                                                            />
                                                            <p className="text-xs text-muted-foreground mt-1 font-mono">{user.qrCode}</p>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-1 text-sm text-gray-500">Generated after payment verification</div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="mt-1 text-sm text-yellow-600 font-medium">Complete payment to view QR Ticket</div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="voting">
                        <LiveVotingPanel />
                    </TabsContent>
                </Tabs>
            </main>

            {/* Edit Profile Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <CardDescription>Update your project and personal details.</CardDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Profile Image</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setProfileImageFile(e.target.files[0]);
                                    }
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Input value={formData.category || ''} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. App Development" />
                        </div>
                        <div className="space-y-2">
                            <Label>Team Name</Label>
                            <Input value={formData.teamName || ''} onChange={e => setFormData({ ...formData, teamName: e.target.value })} placeholder="Enter team name" />
                        </div>
                        <div className="space-y-2">
                            <Label>Team Members (Comma separated, e.g. John Doe, Jane Smith)</Label>
                            <Input
                                value={Array.isArray(formData.teamMembers) ? formData.teamMembers.join(', ') : (formData.teamMembers || '')}
                                onChange={e => setFormData({ ...formData, teamMembers: e.target.value.split(',').map((s: string) => s.trim()) })}
                                placeholder="Member 1, Member 2"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Project Title</Label>
                            <Input value={formData.projectTitle || ''} onChange={e => setFormData({ ...formData, projectTitle: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Project Links (GitHub/Drive)</Label>
                            <Input value={formData.projectLinks || ''} onChange={e => setFormData({ ...formData, projectLinks: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={formData.projectDescription || ''} onChange={e => setFormData({ ...formData, projectDescription: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdate} disabled={updating}>
                            {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Toaster />
        </div>
    );
}
