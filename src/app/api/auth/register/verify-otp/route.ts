
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Verification from '@/models/Verification';

export async function POST(req: Request) {
    await dbConnect();
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
        }

        const record = await Verification.findOne({ email });

        if (!record) {
            return NextResponse.json({ error: 'No verification request found for this email.' }, { status: 404 });
        }

        // Check expiry (though TTL handles it, logic check is safer)
        if (new Date() > record.expiresAt) {
            return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
        }

        // Check OTP match
        if (record.otp !== otp) {
            return NextResponse.json({ error: 'Invalid OTP.' }, { status: 400 });
        }

        // Mark as verified
        record.verified = true;
        // Extend expiry so they have time to finish registration form? 
        // Or keep it. If they take > 15 mins to fill form, they might need to re-verify?
        // Let's extend it to 1 hour to prevent frustration.
        record.expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await record.save();

        return NextResponse.json({ success: true, message: 'Email verified successfully' });

    } catch (e: any) {
        console.error("Verify OTP Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
