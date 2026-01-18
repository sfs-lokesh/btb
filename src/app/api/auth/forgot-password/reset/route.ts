
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { email, otp, newPassword } = await req.json();

        // 1. Find User
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: 'User not found.' }, { status: 404 });
        }

        // 2. Double check OTP (security measure)
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        if (
            user.resetPasswordToken !== hashedOtp ||
            user.resetPasswordExpire < new Date()
        ) {
            return NextResponse.json({ error: 'Invalid or expired session. Please try again.' }, { status: 400 });
        }

        // 3. Update Password
        user.password = newPassword; // Pre-save hook will hash it
        user.resetPasswordToken = undefined; // Clear Token
        user.resetPasswordExpire = undefined;

        await user.save();

        return NextResponse.json({ message: 'Password reset successfully.' });

    } catch (error: any) {
        console.error("Forgot Password Reset Error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
