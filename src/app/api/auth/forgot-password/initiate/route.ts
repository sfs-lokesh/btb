
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';
import { sendOtpEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { email } = await req.json();

        // 1. Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            // For security, don't reveal if user exists, but for now we might want to be explicit
            return NextResponse.json({ error: 'Email not found.' }, { status: 404 });
        }

        // 2. Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // 3. Save OTP to user record ( reusing email verification fields or adding new ones? 
        //    Let's use specific reset fields to avoid conflict with registration verification)
        user.resetPasswordToken = crypto.createHash('sha256').update(otp).digest('hex'); // We can hash it or store plain if it's short lived OTP. 
        // Actually, the previous code hashed a token. Here we want a 6 digit OTP. 
        // Let's store the HASHED OTP for security.
        user.resetPasswordExpire = otpExpires;

        await user.save();

        // 4. Send Email
        const sent = await sendOtpEmail(email, otp); // Reusing existing OTP email function? Or make a new one for password reset

        if (sent) {
            return NextResponse.json({ message: 'OTP sent successfully.' });
        } else {
            return NextResponse.json({ error: 'Failed to send OTP.' }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Forgot Password Initiate Error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
