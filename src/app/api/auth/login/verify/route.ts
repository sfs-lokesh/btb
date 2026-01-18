
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';
import { generateToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { email, otp } = await req.json();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        if (
            user.resetPasswordToken === hashedOtp &&
            user.resetPasswordExpire > new Date()
        ) {
            // Clear OTP
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            // Generate Token & Login
            const token = generateToken({
                userId: user._id.toString(),
                email: user.email,
                role: user.role
            });

            const cookieStore = await cookies();
            cookieStore.set('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                maxAge: 60 * 60 * 24 * 7,
                path: '/',
                sameSite: 'lax',
            });

            const userObj = user.toObject();
            delete userObj.password;

            return NextResponse.json({ success: true, token, user: userObj });

        } else {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

    } catch (error: any) {
        console.error("Login Verify Error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
