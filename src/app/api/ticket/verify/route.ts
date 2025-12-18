import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
    await dbConnect();
    try {
        const user = await getCurrentUser(req);
        console.log('Verify API - User:', user); // Debug log

        if (!user || (user.role !== 'Manager' && user.role !== 'Admin' && user.role !== 'SuperAdmin')) {
            console.log('Verify API - Unauthorized. Role:', user?.role); // Debug log
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { qrCodeData } = await req.json();

        // Search by qrCodeData or userId
        let ticket = await Ticket.findOne({ qrCodeData }).populate('userId');

        // If not found by QR data, try finding by userId match
        if (!ticket && qrCodeData.length === 24) { // Assuming ObjectId length
            ticket = await Ticket.findOne({ userId: qrCodeData }).populate('userId');
        }

        if (!ticket) {
            return NextResponse.json({ status: 'Invalid', message: 'Ticket not found' }, { status: 404 });
        }

        if (ticket.status === 'Used') {
            return NextResponse.json({
                status: 'Already Scanned',
                message: 'Ticket already used',
                scannedAt: ticket.scannedAt,
                user: ticket.userId
            }, { status: 200 });
        }

        if (ticket.status === 'Invalid') {
            return NextResponse.json({ status: 'Invalid', message: 'Ticket is invalid' }, { status: 400 });
        }

        // Mark as used
        ticket.status = 'Used';
        ticket.scannedAt = new Date();
        ticket.scannedBy = user._id;
        await ticket.save();

        return NextResponse.json({
            status: 'Valid',
            message: 'Access Granted',
            user: ticket.userId
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
