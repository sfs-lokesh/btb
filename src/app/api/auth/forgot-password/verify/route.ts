
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { email, otp } = await req.json();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: 'User not found.' }, { status: 404 });
        }

        // Verify OTP (Hash input and compare)
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        if (
            user.resetPasswordToken === hashedOtp &&
            user.resetPasswordExpire > new Date()
        ) {
            return NextResponse.json({ message: 'OTP Verified' });
        } else {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

    } catch (error: any) {
        console.error("Forgot Password Verify Error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
