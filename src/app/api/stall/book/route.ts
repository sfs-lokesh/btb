import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Stall from '@/models/Stall';

export async function POST(req: Request) {
    await dbConnect();
    try {
        const body = await req.json();
        const { stallId, firstName, lastName, contact, email } = body;

        const stall = await Stall.findById(stallId);
        if (!stall) {
            return NextResponse.json({ message: 'Stall not found' }, { status: 404 });
        }

        if (stall.status === 'Booked') {
            return NextResponse.json({ message: 'Stall is already booked' }, { status: 400 });
        }

        // Don't change status yet - admin will approve/reject
        // Just save the request details
        stall.requestStatus = 'Pending';
        stall.status = 'OnHold'; // Put on hold while pending approval

        // Save booking request details
        stall.bookingDetails = {
            firstName,
            lastName,
            contact,
            email,
            paymentMethod: 'Offline',
            bookingDate: new Date()
        };

        await stall.save();

        return NextResponse.json({ message: 'Booking request submitted successfully. Awaiting admin approval.', stall }, { status: 200 });

    } catch (error: any) {
        console.error('Stall booking error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    await dbConnect();
    try {
        const stalls = await Stall.find({}).sort({ name: 1 });
        return NextResponse.json(stalls);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
