import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SponsorRequest from '@/models/SponsorRequest';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
    await dbConnect();

    try {
        const body = await req.json();
        const { name, businessName, email, phone } = body;

        if (!name || !businessName || !email || !phone) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const newRequest = await SponsorRequest.create({
            name,
            businessName,
            email,
            phone,
        });

        return NextResponse.json({ success: true, message: 'Request submitted successfully', data: newRequest }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    await dbConnect();
    try {
        const user = await getCurrentUser(req);
        if (!user || !['Admin', 'SuperAdmin'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const requests = await SponsorRequest.find().sort({ createdAt: -1 });
        return NextResponse.json(requests);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
