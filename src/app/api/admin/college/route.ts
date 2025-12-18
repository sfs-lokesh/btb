import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import College from '@/models/College';
import { requireAuth, ROLES, getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
    await dbConnect();
    try {
        const auth = await requireAuth(req, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
        if (auth instanceof NextResponse) return auth;

        const { name, couponCode, discountAmount } = await req.json();
        const college = await College.create({
            name,
            code: couponCode, // Map couponCode to code field
            discountAmount
        });
        return NextResponse.json(college, { status: 201 });
    } catch (error: any) {
        console.error('Error creating college:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    await dbConnect();
    try {
        const auth = await requireAuth(req, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
        if (auth instanceof NextResponse) return auth;

        const body = await req.json();
        const { _id, name, ...updates } = body;

        const college = await College.findByIdAndUpdate(_id, { name, ...updates }, { new: true });
        return NextResponse.json(college);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    await dbConnect();
    try {
        const user = await getCurrentUser(req);
        const isAdmin = user && (user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN);

        if (isAdmin) {
            const colleges = await College.find({});
            return NextResponse.json(colleges);
        } else {
            // Public access: select only necessary fields
            const colleges = await College.find({}).select('name code discountAmount _id');
            return NextResponse.json(colleges);
        }
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
