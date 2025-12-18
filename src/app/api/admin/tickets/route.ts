import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import { requireAuth, ROLES } from '@/lib/auth';
// Ensure User model is registered
import User from '@/models/User';

export async function GET(req: NextRequest) {
    await dbConnect();

    try {
        const auth = await requireAuth(req, [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MANAGER]);
        if (auth instanceof NextResponse) return auth;

        const tickets = await Ticket.find({})
            .populate('userId', 'name email role')
            .populate('scannedBy', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json(tickets);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    await dbConnect();
    try {
        const auth = await requireAuth(req, [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MANAGER]);
        if (auth instanceof NextResponse) return auth;

        const { ticketId, status } = await req.json();

        const updates: any = { status };
        if (status === 'Valid') {
            updates.scannedAt = null;
            updates.scannedBy = null;
        }

        const ticket = await Ticket.findByIdAndUpdate(ticketId, updates, { new: true })
            .populate('userId', 'name email')
            .populate('scannedBy', 'name');

        return NextResponse.json(ticket);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
