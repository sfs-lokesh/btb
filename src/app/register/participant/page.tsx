'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

type College = {
    _id: string;
    name: string;
    code: string;
    discountAmount: number;
};

type FormData = {
    name: string;
    email: string;
    password: string;
    phone: string;
    collegeId: string;
    couponCode: string;
    teamType: string;
    teamName: string;
    teamMembers: { value: string }[];
    category: string;
    projectTitle: string;
    projectDescription: string;
    projectLinks: string;
    skillVerification: boolean;
    guidelinesAccepted: boolean;
};

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function ParticipantRegister() {
    const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            name: '',
            email: '',
            password: '',
            phone: '',
            collegeId: '',
            couponCode: '',
            teamType: 'Solo',
            teamName: '',
            teamMembers: [{ value: '' }],
            category: 'Web Development',
            projectTitle: '',
            projectDescription: '',
            projectLinks: '',
            skillVerification: false,
            guidelinesAccepted: false
        }
    });

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: "teamMembers"
    });

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [colleges, setColleges] = useState<College[]>([]);
    const [finalPrice, setFinalPrice] = useState(1800);
    const [discount, setDiscount] = useState(0);
    const [couponType, setCouponType] = useState<'College' | 'Influencer' | null>(null);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    // Load Razorpay Script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setValue('projectLinks', data.url);
                toast({
                    title: "File uploaded successfully!",
                    description: "Project link has been auto-filled.",
                });
            } else {
                toast({
                    title: "Upload failed",
                    description: data.error,
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast({
                title: "Upload failed",
                description: "An error occurred while uploading the file.",
                variant: "destructive"
            });
        } finally {
            setUploading(false);
        }
    };

    const teamType = watch('teamType');
    const selectedCollegeId = watch('collegeId');
    const enteredCoupon = watch('couponCode');

    useEffect(() => {
        fetch('/api/admin/college')
            .then(res => res.json())
            .then(data => setColleges(data))
            .catch(err => console.error('Failed to fetch colleges', err));
    }, []);

    // Update team members array based on team type
    useEffect(() => {
        let count = 0;
        if (teamType === 'Team of 2') count = 1; // +1 member (excluding lead)
        if (teamType === 'Team of 3') count = 2;
        if (teamType === 'Team of 4') count = 3;

        if (teamType === 'Solo') {
            replace([]);
        } else {
            const currentLength = fields.length;
            if (currentLength < count) {
                for (let i = currentLength; i < count; i++) append({ value: '' });
            } else if (currentLength > count) {
                for (let i = currentLength; i > count; i--) remove(i - 1);
            }
        }
    }, [teamType, append, remove, replace, fields.length]);

    // Coupon Logic
    useEffect(() => {
        if (!enteredCoupon) {
            setDiscount(0);
            setFinalPrice(1800);
            setCouponType(null);
            return;
        }

        const selectedCollege = colleges.find(c => c._id === selectedCollegeId);
        if (selectedCollege && enteredCoupon === selectedCollege.code) {
            setDiscount(selectedCollege.discountAmount);
            setFinalPrice(1800 - selectedCollege.discountAmount);
            setCouponType('College');
        } else {
            // Mock logic for influencer coupons in frontend (Actual validation happens in backend)
            if (enteredCoupon.length > 3) {
                // We rely on backend validation mainly, but here we can't easily know the discount without an API call.
                // For this registration flow, we will let the backend calculate the final price if we want to be secure,
                // but for UI feedback we might need an API to validate coupon. 
                // For now, retaining user logic:
                if (enteredCoupon.startsWith('INF')) {
                    setDiscount(200);
                    setFinalPrice(1600);
                    setCouponType('Influencer');
                } else {
                    // For unknown coupons, maybe reset or keep as is (backend will reject if invalid)
                    // setDiscount(0);
                    // setFinalPrice(1800);
                    // setCouponType(null);
                }
            } else {
                setDiscount(0);
                setFinalPrice(1800);
                setCouponType(null);
            }
        }
    }, [enteredCoupon, selectedCollegeId, colleges]);

    // Validate college coupon restriction
    const validateCollegeCoupon = (couponCode: string): boolean => {
        if (!couponCode) return true; // No coupon is valid

        const selectedCollege = colleges.find(c => c._id === selectedCollegeId);

        // Check if it's a college coupon
        const isCollegeCoupon = colleges.some(c => c.code === couponCode);

        if (isCollegeCoupon) {
            // If it's a college coupon, it must match the selected college
            if (selectedCollege && couponCode === selectedCollege.code) {
                return true; // Valid: student using their own college coupon
            } else {
                return false; // Invalid: student trying to use another college's coupon
            }
        }

        // If it's not a college coupon, assume it's an influencer coupon (backend will validate)
        return true;
    };


    const initializePayment = async (userData: any, ticketData: any) => {
        // If price is 0, no payment needed
        if (ticketData.price === 0) {
            const res = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userData.id, isExempt: true }),
            });
            if (res.ok) {
                router.push('/login?registered=true');
            } else {
                alert("Verification failed");
            }
            return;
        }

        // Create Order
        const orderRes = await fetch('/api/payment/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: ticketData.price,
                currency: 'INR',
                receipt: `receipt_${userData.id}`
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
            description: "Event Registration",
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
                        userId: userData.id
                    }),
                });

                const verifyData = await verifyRes.json();
                if (verifyData.success) {
                    toast({
                        title: "Registration Successful!",
                        description: "Your payment has been verified. Please login to continue.",
                    });
                    router.push('/login?registered=true');
                } else {
                    toast({
                        title: "Payment verification failed",
                        description: verifyData.message,
                        variant: "destructive"
                    });
                }
            },
            prefill: {
                name: userData.name || '',
                email: userData.email || '',
                contact: userData.phone || '' // Need to ensure phone is passed in userData if available, or fetch from form
            },
            theme: {
                color: "#3399cc"
            }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response: any) {
            alert(response.error.description);
        });
        rzp1.open();
    };

    const onSubmit = async (data: FormData) => {
        // Validate college coupon before submission
        if (data.couponCode && !validateCollegeCoupon(data.couponCode)) {
            toast({
                title: "Invalid Coupon",
                description: "You can only use your own college's coupon code.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            const formattedData = {
                ...data,
                teamMembers: data.teamMembers.map(m => m.value),
                role: 'Participant'
            };

            // 1. Register User (Pending Payment)
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formattedData),
            });

            const result = await res.json();

            if (res.ok) {
                toast({
                    title: "Registration Initiated",
                    description: "Please complete the payment to finish registration.",
                });
                // 2. Start Payment Flow
                await initializePayment({ ...result.user, phone: data.phone, name: data.name }, result.ticket);
            } else {
                toast({
                    title: "Registration Failed",
                    description: result.message,
                    variant: "destructive"
                });
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive"
            });
            setLoading(false);
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    return (
        <div className="max-w-2xl mx-auto mt-36 p-6 bg-card border border-border rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-foreground">Participant Registration</h1>

            {/* Progress Indicator */}
            <div className="flex justify-between mb-8 text-sm font-medium text-muted-foreground">
                <span className={step >= 1 ? "text-primary" : ""}>1. Personal</span>
                <span className={step >= 2 ? "text-primary" : ""}>2. Team & Project</span>
                <span className={step >= 3 ? "text-primary" : ""}>3. Review & Pay</span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Step 1: Personal Info */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground">Full Name</label>
                                <input {...register('name', { required: true })} className="w-full bg-secondary border-input text-foreground p-2 rounded border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground">Phone</label>
                                <input
                                    {...register('phone', {
                                        required: 'Phone number is required',
                                        pattern: {
                                            value: /^[0-9]{10}$/,
                                            message: 'Phone must be exactly 10 digits'
                                        }
                                    })}
                                    className="w-full bg-secondary border-input text-foreground p-2 rounded border"
                                    placeholder="10-digit mobile number"
                                    maxLength={10}
                                />
                                {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground">Email</label>
                            <input
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address'
                                    }
                                })}
                                className="w-full bg-secondary border-input text-foreground p-2 rounded border"
                                type="email"
                            />
                            {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground">Password</label>
                            <input {...register('password', { required: true, minLength: 6 })} className="w-full bg-secondary border-input text-foreground p-2 rounded border" type="password" />
                            {errors.password && <span className="text-xs text-red-500">Password must be at least 6 characters</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground">Select College</label>
                            <select {...register('collegeId', { required: "Please select your college" })} className="w-full bg-secondary border-input text-foreground p-2 rounded border">
                                <option value="">-- Select College --</option>
                                {colleges.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                            {errors.collegeId && <span className="text-xs text-red-500">{errors.collegeId.message}</span>}
                        </div>

                        <div className="pt-4">
                            <button type="button" onClick={nextStep} className="w-full bg-primary text-primary-foreground p-2 rounded hover:bg-primary/90">Next: Team Details</button>
                        </div>
                    </div>
                )}

                {/* Step 2: Team & Project */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground">Team Structure</label>
                            <select {...register('teamType')} className="w-full bg-secondary border-input text-foreground p-2 rounded border">
                                <option value="Solo">Solo</option>
                                <option value="Team of 2">Team of 2</option>
                                <option value="Team of 3">Team of 3</option>
                                <option value="Team of 4">Team of 4</option>
                            </select>
                        </div>

                        {teamType !== 'Solo' && (
                            <div>
                                <label className="block text-sm font-medium text-foreground">Team Name</label>
                                <input {...register('teamName', { required: true })} className="w-full bg-secondary border-input text-foreground p-2 rounded border" />
                            </div>
                        )}

                        {fields.map((field, index) => (
                            <div key={field.id}>
                                <label className="block text-sm font-medium text-foreground">Team Member {index + 1} Name</label>
                                <input {...register(`teamMembers.${index}.value` as const, { required: true })} className="w-full bg-secondary border-input text-foreground p-2 rounded border" />
                            </div>
                        ))}

                        <div className="border-t border-border my-4 pt-4">
                            <h3 className="text-lg font-semibold mb-3 text-foreground">Project Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-foreground">Category</label>
                                    <select {...register('category')} className="w-full bg-secondary border-input text-foreground p-2 rounded border">
                                        <option value="Web Development">Web Development</option>
                                        <option value="App Development">App Development</option>
                                        <option value="Software">Software</option>
                                        <option value="VFX">VFX</option>
                                        <option value="3D">3D</option>
                                        <option value="Animation">Animation</option>
                                        <option value="Film">Film</option>
                                        <option value="Product">Product</option>
                                        <option value="Startup">Startup</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground">Project Title</label>
                                    <input {...register('projectTitle', { required: true })} className="w-full bg-secondary border-input text-foreground p-2 rounded border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground">Description (60-100 chars)</label>
                                    <textarea {...register('projectDescription', { required: true, minLength: 60 })} className="w-full bg-secondary border-input text-foreground p-2 rounded border" rows={3} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground">Project Links (GitHub/Drive) OR Upload Abstract</label>
                                    <div className="flex gap-2">
                                        <input {...register('projectLinks')} className="flex-1 bg-secondary border-input text-foreground p-2 rounded border" placeholder="https://..." />
                                        <div className="relative">
                                            <input
                                                type="file"
                                                onChange={handleFileUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                                disabled={uploading}
                                            />
                                            <button type="button" className="bg-secondary border border-input text-foreground px-3 py-2 rounded hover:bg-secondary/80">
                                                {uploading ? 'Uploading...' : 'Upload'}
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Supported: PDF, DOC, PNG, JPG. Uploading will auto-fill the link.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={prevStep} className="w-1/3 bg-secondary text-secondary-foreground p-2 rounded hover:bg-secondary/80">Back</button>
                            <button type="button" onClick={nextStep} className="w-2/3 bg-primary text-primary-foreground p-2 rounded hover:bg-primary/90">Next: Payment</button>
                        </div>
                    </div>
                )}

                {/* Step 3: Payment & Review */}
                {step === 3 && (
                    <div className="space-y-4">
                        <div className="bg-secondary/20 p-4 rounded-lg border border-border">
                            <h3 className="font-semibold text-foreground mb-2">Review Details</h3>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Name:</span>
                                    <span>{watch('name')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Email:</span>
                                    <span>{watch('email')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Phone:</span>
                                    <span>{watch('phone')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">College:</span>
                                    <span>{colleges.find(c => c._id === watch('collegeId'))?.name || '-'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-secondary/20 p-4 rounded-lg border border-border">
                            <h3 className="font-semibold text-foreground mb-2">Order Summary</h3>
                            <div className="flex justify-between text-sm">
                                <span>Base Ticket Price</span>
                                <span>₹1800</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-sm text-green-500">
                                    <span>Discount ({couponType})</span>
                                    <span>-₹{discount}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg mt-2 border-t border-border pt-2">
                                <span>Total Payable</span>
                                <span>₹{finalPrice}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground">Coupon Code</label>
                            <div className="flex gap-2">
                                <input {...register('couponCode')} className="flex-1 bg-secondary border-input text-foreground p-2 rounded border" placeholder="Enter College or Influencer Code" />
                            </div>
                            {enteredCoupon && !couponType && (
                                <p className="text-xs text-red-500 mt-1">
                                    {!validateCollegeCoupon(enteredCoupon)
                                        ? 'You can only use your own college\'s coupon code. Please use your college code or an influencer code.'
                                        : 'Invalid coupon code'
                                    }
                                </p>
                            )}
                            {couponType && <p className="text-xs text-green-500 mt-1">Coupon applied successfully!</p>}
                        </div>

                        <div className="border-t border-border pt-4 mt-4 space-y-3">
                            <div className="flex items-start gap-2">
                                <input type="checkbox" {...register('skillVerification', { required: true })} id="skillVerify" className="mt-1" />
                                <label htmlFor="skillVerify" className="text-sm text-muted-foreground">
                                    I confirm that I possess the necessary skills for the selected category and that my submission is genuine. I understand that idea-level submissions without a prototype/MVP will be rejected.
                                </label>
                            </div>
                            <div className="flex items-start gap-2">
                                <input type="checkbox" {...register('guidelinesAccepted', { required: true })} id="guidelines" className="mt-1" />
                                <label htmlFor="guidelines" className="text-sm text-muted-foreground">
                                    I have read and agree to the event guidelines and rules.
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={prevStep} className="w-1/3 bg-secondary text-secondary-foreground p-2 rounded hover:bg-secondary/80">Back</button>
                            <button type="submit" disabled={loading} className="w-2/3 bg-primary text-primary-foreground p-2 rounded hover:bg-primary/90">
                                {loading ? 'Processing...' : `Pay ₹${finalPrice} & Register`}
                            </button>
                        </div>
                    </div>
                )}

            </form>
            <Toaster />
        </div>
    );
}
