
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';
import { sendOtpEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { email, password } = await req.json();

        // 1. Verify credentials first
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // 2. Enforce payment check
        if (user.role === 'Participant' && user.paymentStatus !== 'Completed') {
            return NextResponse.json(
                { error: 'Registration incomplete. Please complete your payment first.' },
                { status: 403 }
            );
        }

        // 3. Generate and Save OTP
        // We reuse the resetPasswordToken fields or add new ones specifically for 2FA?
        // Let's reuse reset fields for simplicity or better yet: add a specific otp field if "reset" token semantic is strict.
        // Given the User model isn't open, I'll stick to a new temporary logic or reuse existing if suitable.
        // Actually, let's use the same reset token logic, it's just a temporary code.

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        // Store hashed OTP
        user.resetPasswordToken = crypto.createHash('sha256').update(otp).digest('hex');
        user.resetPasswordExpire = otpExpires;
        await user.save();

        // 4. Send Email
        const sent = await sendOtpEmail(email, otp);

        if (sent) {
            return NextResponse.json({ message: '2FA OTP sent', requireOtp: true });
        } else {
            return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Login Initiate Error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
