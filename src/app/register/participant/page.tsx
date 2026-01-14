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
    guidelinesAccepted: boolean;
};

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function ParticipantRegister() {
    const { register, handleSubmit, control, watch, setValue, trigger, formState: { errors } } = useForm<FormData>({
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

    // OTP States
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otp, setOtp] = useState('');
    const [verifyingOtp, setVerifyingOtp] = useState(false);

    const teamType = watch('teamType');
    const selectedCollegeId = watch('collegeId');
    const enteredCoupon = watch('couponCode');

    // Load Razorpay Script
    // ... (rest of useEffects)

    const sendOtp = async () => {
        const email = watch('email');
        const emailValid = await trigger('email');
        if (!emailValid || !email) {
            toast({ title: "Invalid Email", description: "Please enter a valid email first.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/register/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                setOtpSent(true);
                toast({ title: "OTP Sent", description: "Please check your email for the OTP." });
            } else {
                toast({ title: "Error", description: data.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to send OTP.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const verifyCode = async () => {
        if (!otp || otp.length < 6) {
            toast({ title: "Invalid OTP", description: "Please enter a 6-digit OTP.", variant: "destructive" });
            return;
        }
        setVerifyingOtp(true);
        try {
            const email = watch('email');
            const res = await fetch('/api/auth/register/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            if (res.ok) {
                setOtpVerified(true);
                setOtpSent(false); // To hide OTP input and show verify success state
                toast({ title: "Verified", description: "Email verified successfully." });
            } else {
                toast({ title: "Verification Failed", description: data.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Verification failed.", variant: "destructive" });
        } finally {
            setVerifyingOtp(false);
        }
    };

    // ... existing effect ...

    // ... inside return ...


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
            toast({
                title: "Payment Failed",
                description: response.error.description,
                variant: "destructive"
            });
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
                if (result.error === "User already exists" || result.message === "User already exists") {
                    toast({
                        title: "Registration Failed",
                        description: "User with this email or phone already exists.",
                        variant: "destructive"
                    });
                } else {
                    toast({
                        title: "Registration Failed",
                        description: result.error || result.message || "Unknown error occurred",
                        variant: "destructive"
                    });
                }
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

    const nextStep = async () => {
        let valid = false;
        if (step === 1) {
            valid = await trigger(['name', 'email', 'phone', 'collegeId', 'password']);

            // Double check specific fields if global trigger is fussy, but trigger([]) should work.
            if (!valid) {
                // Force show errors
                const phoneValid = await trigger('phone');
                if (!phoneValid) {
                    toast({
                        title: "Validation Error",
                        description: "Please enter correct mobile number",
                        variant: "destructive"
                    });
                    return;
                }
                return;
            }

            if (!otpVerified) {
                toast({
                    title: "Email not verified",
                    description: "Please verify your email address to proceed.",
                    variant: "destructive"
                });
                return;
            }
        } else if (step === 2) {
            const f1 = await trigger('teamType');
            const f2 = teamType !== 'Solo' ? await trigger('teamName') : true;
            const f3 = await trigger('projectTitle');
            const f4 = await trigger('projectDescription');
            const f5 = await trigger('category');

            // Check team members
            let membersValid = true;
            if (teamType !== 'Solo') {
                // We need to trigger validation for teamMembers fields
                // react-hook-form trigger accepts path or array of paths
                const memberPaths = fields.map((_, i) => `teamMembers.${i}.value` as const);
                membersValid = await trigger(memberPaths);
            }

            valid = f1 && f2 && f3 && f4 && f5 && membersValid;

            if (!valid) {
                toast({
                    title: "Validation Error",
                    description: "Please check all required fields in this step.",
                    variant: "destructive"
                });
            }
        }

        if (valid) {
            setStep(prev => prev + 1);
        }
    };
    const prevStep = () => setStep(prev => prev - 1);


    return (
        <div className="max-w-2xl mx-auto mt-36 p-6 bg-card border border-border rounded-lg shadow-md" >
            <h1 className="text-2xl font-bold mb-6 text-foreground">Participant Registration</h1>

            {/* Progress Indicator */}
            <div className="flex justify-between mb-8 text-sm font-medium text-muted-foreground" >
                <span className={step >= 1 ? "text-primary" : ""}>1. Personal</span>
                <span className={step >= 2 ? "text-primary" : ""}>2. Team & Project</span>
                <span className={step >= 3 ? "text-primary" : ""}>3. Review & Pay</span>
            </div >

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
                            <div className="flex gap-2">
                                <input
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address'
                                        }
                                    })}
                                    className={`flex-1 bg-secondary border-input text-foreground p-2 rounded border ${otpVerified ? 'border-green-500' : ''}`}
                                    type="email"
                                    disabled={otpVerified}
                                />
                                {!otpVerified && (
                                    <button
                                        type="button"
                                        onClick={sendOtp}
                                        className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm whitespace-nowrap"
                                        disabled={loading || otpSent}
                                    >
                                        {loading ? 'Sending...' : (otpSent ? 'Resend OTP' : 'Verify Email')}
                                    </button>
                                )}
                                {otpVerified && (
                                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded text-sm font-medium flex items-center">
                                        Verified
                                    </span>
                                )}
                            </div>
                            {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}

                            {otpSent && !otpVerified && (
                                <div className="mt-2 flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="flex-1 bg-secondary border-input text-foreground p-2 rounded border"
                                        maxLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={verifyCode}
                                        disabled={verifyingOtp}
                                        className="bg-green-600 text-white px-4 py-2 rounded text-sm"
                                    >
                                        {verifyingOtp ? 'Checking...' : 'Submit OTP'}
                                    </button>
                                </div>
                            )}
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
                                    {errors.projectTitle && <span className="text-xs text-red-500">{errors.projectTitle.message || 'Project title is required'}</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground">Description</label>
                                    <textarea {...register('projectDescription', { required: true })} className="w-full bg-secondary border-input text-foreground p-2 rounded border" rows={3} />
                                    {errors.projectDescription && <span className="text-xs text-red-500">{errors.projectDescription.message || 'Project description is required'}</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground">Project Links (GitHub/Drive)</label>
                                    <div className="flex gap-2">
                                        <input
                                            {...register('projectLinks')}
                                            className="flex-1 bg-secondary border-input text-foreground p-2 rounded border"
                                            placeholder="https://..."
                                        />
                                    </div>
                                    {errors.projectLinks && <span className="text-xs text-red-500">{errors.projectLinks.message}</span>}
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
        </div >
    );
}
