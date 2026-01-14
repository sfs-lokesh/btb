
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Verification from '@/models/Verification';
import { sendOtpEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: Request) {
    await dbConnect();
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // 1. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // Include message if they are already verified, or if we treat existence = registered
            // The user request says "if a user registers with wrong email...". 
            // If they exist, they should login.
            return NextResponse.json({ error: 'User with this email already exists. Please login.' }, { status: 409 });
        }

        // 2. Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // 3. Store in Verification collection (Upsert)
        await Verification.findOneAndUpdate(
            { email },
            {
                otp,
                verified: false,
                expiresAt
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // 4. Send Email
        const emailSent = await sendOtpEmail(email, otp);

        if (!emailSent) {
            return NextResponse.json({ error: 'Failed to send OTP email.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'OTP sent successfully' });

    } catch (e: any) {
        console.error("Send OTP Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
