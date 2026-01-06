import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Stall from '@/models/Stall';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
    await dbConnect();

    try {
        const user = await getCurrentUser(req);
        if (!user || (user.role !== 'Admin' && user.role !== 'SuperAdmin')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, category, price, location } = body;

        const newStall = await Stall.create({
            name,
            category,
            price,
            location: location || 'TBD',
            status: 'Available'
        });

        return NextResponse.json({ message: 'Stall created successfully', stall: newStall }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
    }
}
