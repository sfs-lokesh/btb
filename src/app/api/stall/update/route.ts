import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Stall from '@/models/Stall';
import { requireAuth, ROLES } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
    await dbConnect();
    try {
        const auth = await requireAuth(req, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
        if (auth instanceof NextResponse) return auth;

        const { stallId, updates } = await req.json();

        if (!stallId) {
            return NextResponse.json({ error: 'Stall ID is required' }, { status: 400 });
        }

        const stall = await Stall.findByIdAndUpdate(
            stallId,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!stall) {
            return NextResponse.json({ error: 'Stall not found' }, { status: 404 });
        }

        return NextResponse.json(stall);
    } catch (error: any) {
        console.error('Error updating stall:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
