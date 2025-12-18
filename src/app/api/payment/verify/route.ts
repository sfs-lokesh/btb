import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Ticket from '@/models/Ticket';
import crypto from 'crypto';

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
                user.paymentStatus = 'Completed';
                await user.save();

                // Find ticket and update
                await Ticket.findOneAndUpdate({ userId: user._id }, { status: 'Valid' });
            }

            return NextResponse.json({ success: true, message: 'Payment verified' });
        } else {
            return NextResponse.json({ success: false, message: 'Invalid payment signature' }, { status: 400 });
        }

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
