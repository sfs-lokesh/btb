import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Stall from '@/models/Stall';
import { requireAuth, ROLES } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
    await dbConnect();
    try {
        const auth = await requireAuth(req, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
        if (auth instanceof NextResponse) return auth;

        const { stallId, action } = await req.json();

        if (!stallId || !action) {
            return NextResponse.json({ error: 'Stall ID and action are required' }, { status: 400 });
        }

        const stall = await Stall.findById(stallId);
        if (!stall) {
            return NextResponse.json({ error: 'Stall not found' }, { status: 404 });
        }

        // Handle approval actions
        if (action === 'approve') {
            stall.requestStatus = 'Approved';
            stall.status = 'Booked';
        } else if (action === 'reject') {
            stall.requestStatus = 'Rejected';
            stall.status = 'Available';
            // Clear booking details on rejection
            stall.bookingDetails = undefined;
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        await stall.save();
        return NextResponse.json({ message: `Booking ${action}d successfully`, stall });
    } catch (error: any) {
        console.error('Error approving/rejecting stall:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
