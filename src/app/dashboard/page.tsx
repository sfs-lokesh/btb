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

export default function UserDashboard() {
    const router = useRouter();
    const { pitches } = useContext(PitchContext);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [updating, setUpdating] = useState(false);

    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

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
                alert('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Network error');
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
        </div>
    );
}
