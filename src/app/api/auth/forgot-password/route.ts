import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { email } = await req.json();

        const user = await User.findOne({ email });
        if (!user) {
            // Do not reveal if user exists
            return NextResponse.json({ message: 'If an account exists with this email, a reset link has been sent.' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash token and save to database
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Token expires in 10 minutes
        user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

        try {
            const emailSent = await sendPasswordResetEmail(user.email, resetUrl);
            if (!emailSent) {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpire = undefined;
                await user.save();
                return NextResponse.json({ error: 'Email could not be sent' }, { status: 500 });
            }

            return NextResponse.json({ message: 'Email sent' });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return NextResponse.json({ error: 'Email could not be sent' }, { status: 500 });
        }

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
