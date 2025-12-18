import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth, ROLES } from '@/lib/auth';

export async function PUT(req: NextRequest) {
    await dbConnect();
    const auth = await requireAuth(req, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
    if (auth instanceof NextResponse) return auth;

    try {
        const body = await req.json();
        const { _id, ...updates } = body;

        // Remove sensitive fields if necessary, or trust Admin
        // Typically avoid updating password here unless specifically handled
        delete updates.password;

        const user = await User.findByIdAndUpdate(_id, updates, { new: true });
        return NextResponse.json(user);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    await dbConnect();
    const auth = await requireAuth(req, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        await User.findByIdAndDelete(id);
        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
