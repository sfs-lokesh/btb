import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { PRICING } from '@/lib/constants';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'test_key_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_key_secret',
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { amount, currency = 'INR', receipt } = body;

        console.log('Creating Razorpay Order with Key:', process.env.RAZORPAY_KEY_ID?.slice(0, 10) + '...');



        // Create Order
        const options = {
            amount: amount * 100, // Amount in paise
            currency,
            receipt,
            payment_capture: 1, // Auto capture
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID // Public key for client
        });
    } catch (error: any) {
        console.error('Razorpay Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
