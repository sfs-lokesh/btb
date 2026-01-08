'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Stall = {
    _id: string;
    name: string;
    location: string;
    category: 'Premium' | 'Standard' | 'Economy';
    price: number;
    status: 'Available' | 'Booked' | 'OnHold';
};

export default function StallBooking() {
    const [stalls, setStalls] = useState<Stall[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStall, setSelectedStall] = useState<Stall | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        contact: '',
        email: ''
    });

    useEffect(() => {
        fetchStalls();
    }, []);

    const fetchStalls = async () => {
        try {
            const res = await fetch('/api/stall/book');
            const data = await res.json();
            setStalls(data);
        } catch (error) {
            console.error('Error fetching stalls:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStallClick = (stall: Stall) => {
        if (stall.status !== 'Available') return;
        setSelectedStall(stall);
        setIsModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleBookStall = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStall) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/stall/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stallId: selectedStall._id,
                    ...formData
                }),
            });

            if (res.ok) {
                alert('Enquiry for Stall Booking is Created, Our Team will Connect with you Soon');
                setIsModalOpen(false);
                setFormData({ firstName: '', lastName: '', contact: '', email: '' });
                fetchStalls(); // Refresh
            } else {
                const error = await res.json();
                alert(error.message);
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen pt-32 pb-12 px-4 max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-2 text-foreground">Stall Booking</h1>
            <p className="text-muted-foreground mb-8">Select a stall to view details and book.</p>

            {/* Legend */}
            <div className="flex gap-6 mb-8 text-sm font-medium">
                <div className="flex items-center gap-2"><span className="w-4 h-4 bg-green-500 rounded"></span> Available</div>
                <div className="flex items-center gap-2"><span className="w-4 h-4 bg-red-500 rounded"></span> Booked</div>
                <div className="flex items-center gap-2"><span className="w-4 h-4 bg-yellow-500 rounded"></span> On Hold</div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {stalls.map((stall) => (
                    <div
                        key={stall._id}
                        onClick={() => handleStallClick(stall)}
                        className={`
                            relative p-4 rounded-lg border-2 transition-all cursor-pointer h-32 flex flex-col justify-between
                            ${stall.status === 'Available' ? 'bg-green-500/10 border-green-500 hover:bg-green-500/20' : ''}
                            ${stall.status === 'Booked' ? 'bg-red-500/10 border-red-500 cursor-not-allowed opacity-80' : ''}
                            ${stall.status === 'OnHold' ? 'bg-yellow-500/10 border-yellow-500 cursor-not-allowed' : ''}
                        `}
                    >
                        <div className="flex justify-between items-start">
                            <span className="font-bold text-lg">{stall.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-background/50 border border-border">
                                {stall.category[0]}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground truncate">{stall.location}</p>
                            <p className="font-semibold mt-1">₹{stall.price}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Booking Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Book {selectedStall?.name}</DialogTitle>
                        <DialogDescription>
                            {selectedStall?.category} Stall at {selectedStall?.location} - <span className="font-bold text-foreground">₹{selectedStall?.price}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleBookStall} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input id="firstName" name="firstName" required value={formData.firstName} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" name="lastName" required value={formData.lastName} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact">Contact Number</Label>
                            <Input id="contact" name="contact" required minLength={10} value={formData.contact} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email (Optional)</Label>
                            <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                        </div>

                        <div className="bg-secondary/50 p-3 rounded text-sm text-muted-foreground">
                            <p>Our team will contact you for further proceedings.</p>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? 'Booking...' : 'Confirm Booking'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
