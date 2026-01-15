import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';


import Ticket from '@/models/Ticket';
import College from '@/models/College';
import InfluencerCoupon from '@/models/InfluencerCoupon';
import crypto from 'crypto';
import { sendRegistrationEmail } from '@/lib/email';
import { PRICING } from '@/lib/constants';



export async function POST(req: Request) {
    await dbConnect();
    try {
        const body = await req.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            userId,
            isExempt
        } = body;

        // If amount is 0 (delegates/100% discount), we might skip signature check or handle differently
        if (isExempt) {
            const user = await User.findById(userId);
            if (user) {
                user.paymentStatus = 'Completed';
                await user.save();
                await Ticket.findOneAndUpdate({ userId: user._id }, { status: 'Valid' });
                return NextResponse.json({ success: true, message: 'Free registration verified' });
            }
            return NextResponse.json({ success: false, message: 'User not found' });
        }

        // Verify Signature
        const bodyStr = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'test_key_secret')
            .update(bodyStr.toString())
            .digest("hex");


        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Update User and Ticket status
            const user = await User.findById(userId);
            if (user) {

                // Update counts if user was not already completed
                const wasCompleted = user.paymentStatus === 'Completed';
                user.paymentStatus = 'Completed';
                await user.save();

                // Find ticket and update
                const ticket = await Ticket.findOneAndUpdate(
                    { userId: user._id },
                    { status: 'Valid' },
                    { new: true }
                );

                if (!wasCompleted) {
                    // Update Influencer Coupon count
                    if (user.couponUsed) {
                        const inf = await InfluencerCoupon.findOne({ code: user.couponUsed });
                        if (inf) {
                            inf.usedCount = (inf.usedCount || 0) + 1;
                            await inf.save();
                        }
                    }

                    // Update College registrations and earnings
                    if (user.collegeId) {
                        const college = await College.findById(user.collegeId);
                        if (college) {
                            const collegeEarning = user.couponUsed ? 0 : PRICING.COLLEGE_COMMISSION;
                            college.earnings = (college.earnings || 0) + collegeEarning;
                            college.registrations = (college.registrations || 0) + 1;
                            await college.save();
                        }
                    }
                }


                // Send confirmation email now that payment is confirmed
                if (ticket) {
                    const discount = PRICING.BASE_TICKET_PRICE - ticket.price;
                    await sendRegistrationEmail({
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        ticketId: ticket.qrCodeData,
                        userId: user._id.toString(),
                        qrCodeData: ticket.qrCodeData,
                        finalPrice: ticket.price,
                        discount: discount > 0 ? discount : undefined,
                        couponType: user.couponUsed ? 'Applied' : undefined
                    });
                }
            }

            return NextResponse.json({ success: true, message: 'Payment verified' });
        } else {
            return NextResponse.json({ success: false, message: 'Invalid payment signature' }, { status: 400 });
        }


    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
